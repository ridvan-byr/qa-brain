import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import type { ExtensionContext, TextDocument } from 'vscode';
import { resolveQaCortexRoot } from './extensionPaths';
import type { ReviewRun } from './types';
import { VsCodeLanguageModelProvider } from './lmProvider';

export class ReviewRunner {
  private readonly repoRoot: string;

  constructor(private readonly context: ExtensionContext) {
    this.repoRoot = resolveQaCortexRoot();
  }

  public isSupportedTestFile(filePath: string): boolean {
    try {
      const { Scanner } = this.loadCoreScanner();
      return Scanner.isTestFile(path.basename(filePath));
    } catch (err) {
      // Fallback if core is not built yet
      return /\.(spec|test)\.[jt]sx?$/.test(filePath);
    }
  }

  public getWorkspaceRoot(document?: TextDocument): string {
    if (document?.uri.fsPath) {
      return this.findNearestPackageRoot(path.dirname(document.uri.fsPath));
    }
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
  }

  public async reviewFile(filePath: string, workspaceRoot?: string): Promise<ReviewRun> {
    const config = vscode.workspace.getConfiguration('qaCortex');
    const frameworkOverride = config.get<string>('frameworkOverride', 'Auto');

    if (frameworkOverride === 'Disabled') {
      throw new Error("QA Cortex reviews are disabled by configuration.");
    }

    if (filePath.endsWith('.py')) {
      throw new Error("Python support planned in v4.0");
    }

    const root = workspaceRoot || this.findNearestPackageRoot(path.dirname(filePath));
    const { ReviewPipeline, GeminiProvider } = this.loadCore();
    const apiProvider = config.get<string>('apiProvider', 'Gemini');
    const apiKeySetting = config.get<string>('apiKey', '') || (apiProvider === 'Gemini' ? process.env.GEMINI_API_KEY : '') || process.env.QA_CORTEX_API_KEY || '';
    const apiModel = config.get<string>('apiModel', '');
    const apiEndpoint = config.get<string>('apiEndpoint', '');
    const geminiFallback = new GeminiProvider(apiKeySetting, apiProvider, apiModel, apiEndpoint);
    const lmProvider = new VsCodeLanguageModelProvider(geminiFallback);
    const pipeline = new ReviewPipeline(root, lmProvider, this.repoRoot);
    const { report, result } = await this.runQuietly<{ report: string; result: any }>(() => pipeline.runPipeline(filePath));

    // Dynamic framework detection from Core ContextBuilder
    let frameworkName = 'Unknown';
    try {
      const { RepositoryLoader, ContextBuilder } = this.loadCoreContextBuilder();
      const loader = new RepositoryLoader(root);
      const builder = new ContextBuilder(loader);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const context = builder.buildContext(filePath, fileContent);
      frameworkName = context.framework?.adapterName || context.targetFile?.detectedFramework || 'Unknown';
    } catch (e) {
      // Best-effort context retrieval fallback
    }

    if (frameworkOverride !== 'Auto') {
      frameworkName = frameworkOverride;
    }

    // Capitalize framework name
    if (frameworkName && frameworkName !== 'Unknown') {
      frameworkName = frameworkName.charAt(0).toUpperCase() + frameworkName.slice(1).toLowerCase();
    }

    return { filePath, report, result, framework: frameworkName, reviewScope: 'file' };
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
        reviewScope: 'selection',
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

  private loadCoreScanner(): any {
    const corePath = path.join(this.repoRoot, 'dist', 'src');
    const scannerModule = require(path.join(corePath, 'core', 'Scanner.js'));
    return { Scanner: scannerModule.Scanner };
  }

  private loadCoreContextBuilder(): any {
    const corePath = path.join(this.repoRoot, 'dist', 'src');
    const contextModule = require(path.join(corePath, 'loader', 'ContextBuilder.js'));
    const loaderModule = require(path.join(corePath, 'loader', 'RepositoryLoader.js'));
    return {
      ContextBuilder: contextModule.ContextBuilder,
      RepositoryLoader: loaderModule.RepositoryLoader,
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
