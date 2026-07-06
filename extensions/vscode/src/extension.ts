import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { QaBrainCodeLensProvider } from './codeLens';
import { DiagnosticManager } from './diagnostics';
import { ReviewOutput } from './output';
import { ReviewRunner } from './reviewRunner';
import { QaBrainCodeActionProvider } from './codeActions';
import { DashboardViewModel } from './dashboardViewModel';
import { QaBrainSidebarViewProvider } from './sidebarView';
import { TelemetryManager } from './telemetry';
import type { ReviewRun } from './types';

let latestReportPath: string | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const runner = new ReviewRunner(context);
  const diagnostics = new DiagnosticManager();
  const output = new ReviewOutput();
  const codeLens = new QaBrainCodeLensProvider();
  const telemetry = new TelemetryManager(context);
  const dashboardViewModel = new DashboardViewModel(context);
  const sidebarProvider = new QaBrainSidebarViewProvider(context, dashboardViewModel, telemetry);
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = 'qaBrain.reviewCurrentFile';

  const updateStatus = (text: string, tooltip = 'QA Brain', qualityScore?: number, riskScore?: number): void => {
    const config = vscode.workspace.getConfiguration('qaBrain');
    if (!config.get<boolean>('showStatusBar', true)) {
      statusBar.hide();
      return;
    }

    statusBar.text = text;
    statusBar.tooltip = tooltip;
    statusBar.backgroundColor = undefined;

    const attentionMode = config.get<string>('statusBarAttentionMode', 'icon');

    if (qualityScore !== undefined && riskScore !== undefined) {
      const isCritical = qualityScore < 70 || riskScore > 50;

      if (isCritical && attentionMode !== 'off') {
        if (attentionMode === 'icon') {
          statusBar.text = text.replace('🧠', '⚠️');
        } else if (attentionMode === 'background') {
          statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
      }
    }

    statusBar.show();
  };

  updateStatus('🧠 QA Brain | Ready');

  const reviewCurrentFile = async (uri?: vscode.Uri): Promise<void> => {
    const document = await resolveDocument(uri);
    if (!document) {
      await vscode.window.showWarningMessage('QA Brain: Open a supported test file first.');
      return;
    }
    if (!runner.isSupportedTestFile(document.fileName)) {
      await vscode.window.showWarningMessage('QA Brain: Current file is not a supported test file.');
      return;
    }
    await reviewDocument(document);
  };

  const runTestDesign = async (uri?: vscode.Uri): Promise<void> => {
    const document = await resolveDocument(uri);
    if (!document) {
      await vscode.window.showWarningMessage('QA Brain: Open a supported test file first.');
      return;
    }
    if (!runner.isSupportedTestFile(document.fileName)) {
      await vscode.window.showWarningMessage('QA Brain: Current file is not a supported test file.');
      return;
    }
    if (document.fileName.endsWith('.py')) {
      await vscode.window.showInformationMessage('QA Brain: Python discovery is enabled, but Python test design is not enabled yet.');
      return;
    }
    const workspaceRoot = runner.getWorkspaceRoot(document);
    await runWithProgress(`Analyzing test design in ${path.basename(document.fileName)}...`, async token => {
      if (token.isCancellationRequested) return;
      const startedAt = Date.now();
      await dashboardViewModel.runTestDesign(document.fileName, workspaceRoot);
      telemetry.track('testDesign', {
        durationMs: Date.now() - startedAt,
        success: true,
        context: 'currentFile',
      });
    });
  };

  const reviewSelection = async (): Promise<void> => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      await vscode.window.showWarningMessage('QA Brain: Select a test block to review.');
      return;
    }
    const selectedText = editor.document.getText(editor.selection);
    await runWithProgress(`Reviewing selection in ${path.basename(editor.document.fileName)}...`, async token => {
      if (token.isCancellationRequested) return;
      const startedAt = Date.now();
      const run = await runner.reviewSelection(editor.document, selectedText, editor.selection.start.line);
      await publishReview(editor.document, run);
      telemetry.track('review', {
        durationMs: Date.now() - startedAt,
        success: true,
        context: 'selection',
      });
    });
  };

  const reviewChangedFiles = async (): Promise<void> => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      await vscode.window.showWarningMessage('QA Brain: Open a workspace to review changed files.');
      return;
    }

    const changedFiles = await getChangedTestFiles(workspaceRoot, runner);
    if (changedFiles.length === 0) {
      await vscode.window.showInformationMessage('QA Brain: No changed test files found.');
      return;
    }

    await runWithProgress(`Reviewing ${changedFiles.length} changed test file(s)...`, async token => {
      for (const file of changedFiles) {
        if (token.isCancellationRequested) break;
        const startedAt = Date.now();
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
        const run = await runner.reviewFile(file, workspaceRoot);
        await publishReview(document, run);
        telemetry.track('review', {
          durationMs: Date.now() - startedAt,
          success: true,
          context: 'changedFile',
        });
      }
    });
  };

  const reviewDocument = async (document: vscode.TextDocument): Promise<void> => {
    await runWithProgress(`Reviewing ${path.basename(document.fileName)}...`, async token => {
      if (token.isCancellationRequested) return;
      const startedAt = Date.now();
      const run = await runner.reviewFile(document.fileName, runner.getWorkspaceRoot(document));
      await publishReview(document, run);
      telemetry.track('review', {
        durationMs: Date.now() - startedAt,
        success: true,
        context: 'currentFile',
      });
    });
  };

  const publishReview = async (document: vscode.TextDocument, run: ReviewRun): Promise<void> => {
    const config = vscode.workspace.getConfiguration('qaBrain');
    latestReportPath = runner.writeReport(run);
    output.show(run);

    if (config.get<boolean>('showDiagnostics', true)) {
      diagnostics.setDiagnostics(document, run);
    }

    codeLens.update({
      filePath: document.fileName,
      qualityScore: run.result.score.qualityScore,
      riskScore: run.result.score.riskScore,
      findings: run.result.findings.length,
      reportPath: latestReportPath,
    });

    const frameworkLabel = run.framework ? ` | ${run.framework}` : '';
    updateStatus(
      `🧠 QA Brain${frameworkLabel} | ${run.result.score.qualityScore}`,
      `Risk ${run.result.score.riskScore} • ${run.result.findings.length} finding(s)`,
      run.result.score.qualityScore,
      run.result.score.riskScore
    );

    dashboardViewModel.updateReview(run);

    if (config.get<boolean>('openReportAfterReview', false)) {
      await openLatestReport();
    }
  };

  const runWithProgress = async (title: string, operation: (token: vscode.CancellationToken) => Promise<void>): Promise<void> => {
    updateStatus('🧠 QA Brain | Reviewing...');
    try {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title, cancellable: true },
        async (_progress, token) => operation(token)
      );
      updateStatus('🧠 QA Brain | Ready');
    } catch (error: any) {
      updateStatus('🧠 QA Brain | Ready');
      telemetry.trackCrash(error, 'runWithProgress');
      const errMsg = error?.message || String(error);
      if (errMsg.includes('planned in v4.0') || errMsg.includes('disabled by configuration')) {
        await vscode.window.showInformationMessage(`QA Brain: ${errMsg}`);
      } else {
        await vscode.window.showErrorMessage(`QA Brain review failed: ${errMsg}`);
      }
    }
  };

  const openLatestReport = async (): Promise<void> => {
    if (!latestReportPath || !fs.existsSync(latestReportPath)) {
      await vscode.window.showWarningMessage('QA Brain: No latest report is available yet.');
      return;
    }
    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(latestReportPath));
    await vscode.window.showTextDocument(document, { preview: true });
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('qaBrain.reviewCurrentFile', reviewCurrentFile),
    vscode.commands.registerCommand('qaBrain.runTestDesign', runTestDesign),
    vscode.commands.registerCommand('qaBrain.reviewSelection', reviewSelection),
    vscode.commands.registerCommand('qaBrain.reviewChangedFiles', reviewChangedFiles),
    vscode.commands.registerCommand('qaBrain.openLatestReport', openLatestReport),
    vscode.commands.registerCommand('qaBrain.showFindingDetails', async (message: string) => {
      await vscode.window.showInformationMessage(message, { modal: true });
    }),
    vscode.commands.registerCommand('qaBrain.clearDiagnostics', () => {
      diagnostics.clear();
      codeLens.clear();
      dashboardViewModel.clearState();
      updateStatus('🧠 QA Brain | Ready');
    }),
    vscode.workspace.onDidSaveTextDocument(document => {
      const config = vscode.workspace.getConfiguration('qaBrain');
      if (config.get<boolean>('reviewOnSave', false) && runner.isSupportedTestFile(document.fileName)) {
        reviewDocument(document);
      }
    }),
    vscode.workspace.onDidCloseTextDocument(document => {
      diagnostics.clearUri(document.uri);
    }),
    vscode.window.registerWebviewViewProvider(
      'qaBrain.sidebarView',
      sidebarProvider
    ),
    vscode.languages.registerCodeLensProvider(
      [{ language: 'typescript' }, { language: 'javascript' }, { language: 'python' }],
      codeLens
    ),
    vscode.languages.registerCodeActionsProvider(
      [{ language: 'typescript' }, { language: 'javascript' }, { language: 'python' }],
      new QaBrainCodeActionProvider(),
      { providedCodeActionKinds: QaBrainCodeActionProvider.providedCodeActionKinds }
    ),
    diagnostics,
    output,
    statusBar
  );
}

export function deactivate(): void {
  latestReportPath = undefined;
}

async function resolveDocument(uri?: vscode.Uri): Promise<vscode.TextDocument | undefined> {
  if (uri) return vscode.workspace.openTextDocument(uri);
  return vscode.window.activeTextEditor?.document;
}

async function getChangedTestFiles(workspaceRoot: string, runner: ReviewRunner): Promise<string[]> {
  const changed = await new Promise<string[]>((resolve) => {
    cp.execFile('git', ['diff', '--name-only', 'HEAD', '--'], { cwd: workspaceRoot }, (error, stdout) => {
      if (error) {
        resolve([]);
        return;
      }
      resolve(stdout.split(/\r?\n/).filter(Boolean));
    });
  });

  return changed
    .map(file => path.resolve(workspaceRoot, file))
    .filter(file => fs.existsSync(file) && runner.isSupportedTestFile(file));
}
