import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ExtensionContext, TextDocument } from 'vscode';
import type { ReviewRun } from './types';

export class ReviewRunner {
  private readonly repoRoot: string;

  constructor(private readonly context: ExtensionContext) {
    this.repoRoot = path.resolve(__dirname, '../../../..');
  }

  public isSupportedTestFile(filePath: string): boolean {
    return /\.(spec|test)\.[jt]s$/.test(filePath);
  }

  public getWorkspaceRoot(document?: TextDocument): string {
    if (document?.uri.fsPath) {
      return this.findNearestPackageRoot(path.dirname(document.uri.fsPath));
    }
    return process.cwd();
  }

  public async reviewFile(filePath: string, workspaceRoot?: string): Promise<ReviewRun> {
    const root = workspaceRoot || this.findNearestPackageRoot(path.dirname(filePath));
    const { ReviewPipeline, GeminiProvider } = this.loadCore();
    const pipeline = new ReviewPipeline(root, new GeminiProvider(''), this.repoRoot);
    const { report, result } = await this.runQuietly<{ report: string; result: any }>(() => pipeline.runPipeline(filePath));

    return { filePath, report, result };
  }

  public async reviewSelection(document: TextDocument, selectedText: string, selectionStartLine: number): Promise<ReviewRun> {
    const tempDir = path.join(this.context.globalStorageUri.fsPath || os.tmpdir(), 'selection');
    fs.mkdirSync(tempDir, { recursive: true });
    const extension = path.extname(document.fileName) || '.ts';
    const tempFile = path.join(tempDir, `selection-${Date.now()}.spec${extension}`);
    fs.writeFileSync(tempFile, selectedText, 'utf8');

    try {
      const run = await this.reviewFile(tempFile, this.getWorkspaceRoot(document));
      return {
        ...run,
        filePath: document.fileName,
        selectionStartLine,
      };
    } finally {
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // Best-effort cleanup only.
      }
    }
  }

  public writeReport(run: ReviewRun): string {
    const reportDir = path.join(this.context.globalStorageUri.fsPath || os.tmpdir(), 'reports');
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, 'latest-report.md');
    fs.writeFileSync(reportPath, run.report, 'utf8');
    return reportPath;
  }

  private loadCore(): any {
    const corePath = path.join(this.repoRoot, 'dist', 'src');
    const pipelineModule = require(path.join(corePath, 'core', 'ReviewPipeline.js'));
    const providerModule = require(path.join(corePath, 'reviewer', 'GeminiProvider.js'));
    return {
      ReviewPipeline: pipelineModule.ReviewPipeline,
      GeminiProvider: providerModule.GeminiProvider,
    };
  }

  private findNearestPackageRoot(startDir: string): string {
    let current = startDir;
    while (current && current !== path.dirname(current)) {
      if (fs.existsSync(path.join(current, 'package.json'))) {
        return current;
      }
      current = path.dirname(current);
    }
    return startDir;
  }

  private async runQuietly<T>(operation: () => Promise<T>): Promise<T> {
    const originalLog = console.log;
    console.log = () => undefined;
    try {
      return await operation();
    } finally {
      console.log = originalLog;
    }
  }
}
