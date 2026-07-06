import * as vscode from 'vscode';

export class QaCortexCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const codeActions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== 'QA Cortex') {
        continue;
      }

      // 1. Show Finding Details Action
      const showDetailsAction = new vscode.CodeAction(
        '🔍 QA Cortex: Show Finding Details',
        vscode.CodeActionKind.QuickFix
      );
      showDetailsAction.command = {
        title: 'Show Finding Details',
        command: 'qaCortex.showFindingDetails',
        arguments: [diagnostic.message]
      };
      showDetailsAction.diagnostics = [diagnostic];
      codeActions.push(showDetailsAction);

      // 2. Open Report Action
      const openReportAction = new vscode.CodeAction(
        '📖 QA Cortex: Open Report',
        vscode.CodeActionKind.QuickFix
      );
      openReportAction.command = {
        title: 'Open Report',
        command: 'qaCortex.openLatestReport'
      };
      openReportAction.diagnostics = [diagnostic];
      codeActions.push(openReportAction);
    }

    return codeActions;
  }
}
