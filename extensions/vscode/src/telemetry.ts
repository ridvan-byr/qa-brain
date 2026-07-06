import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

type TelemetryEventName = 'review' | 'testDesign' | 'crash' | 'featureUsage';

interface TelemetryPayload {
  durationMs?: number;
  success?: boolean;
  context?: string;
  feature?: string;
}

export class TelemetryManager {
  private readonly schemaVersion = 1;
  private readonly extensionVersion: string;
  private readonly logPath: string;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.extensionVersion = this.readExtensionVersion();
    this.logPath = path.join(context.globalStorageUri.fsPath, 'telemetry.jsonl');
  }

  public track(eventName: TelemetryEventName, payload: TelemetryPayload = {}): void {
    if (!this.isEnabled()) return;

    const sanitized = this.sanitize(payload);
    const event = {
      schemaVersion: this.schemaVersion,
      extensionVersion: this.extensionVersion,
      eventName,
      timestamp: new Date().toISOString(),
      ...sanitized,
    };

    try {
      fs.mkdirSync(path.dirname(this.logPath), { recursive: true });
      fs.appendFileSync(this.logPath, `${JSON.stringify(event)}\n`, 'utf8');
    } catch {
      // Telemetry must never affect user workflows.
    }
  }

  public trackCrash(error: unknown, context: string): void {
    this.track('crash', {
      success: false,
      context,
      feature: this.classifyError(error),
    });
  }

  public getLogPath(): string {
    return this.logPath;
  }

  private isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('qaBrain');
    const userOptIn = config.get<boolean>('telemetryEnabled', false);
    const editorTelemetryEnabled = vscode.env.isTelemetryEnabled ?? true;
    return Boolean(userOptIn && editorTelemetryEnabled);
  }

  private sanitize(payload: TelemetryPayload): TelemetryPayload {
    return {
      durationMs: typeof payload.durationMs === 'number' ? Math.max(0, Math.round(payload.durationMs)) : undefined,
      success: typeof payload.success === 'boolean' ? payload.success : undefined,
      context: payload.context ? this.safeToken(payload.context) : undefined,
      feature: payload.feature ? this.safeToken(payload.feature) : undefined,
    };
  }

  private safeToken(value: string): string {
    return value.replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 80);
  }

  private classifyError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    if (/disabled/i.test(message)) return 'disabled';
    if (/not found/i.test(message)) return 'not_found';
    if (/unsupported/i.test(message)) return 'unsupported';
    if (/timeout/i.test(message)) return 'timeout';
    return 'unknown';
  }

  private readExtensionVersion(): string {
    const packagePath = path.resolve(__dirname, '../../package.json');
    try {
      const parsed = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as { version?: string };
      return parsed.version || '0.1.0';
    } catch {
      return '0.1.0';
    }
  }
}
