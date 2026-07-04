import * as path from 'path';
import * as vscode from 'vscode';
import type { LastReviewState } from './types';

export class QaBrainCodeLensProvider implements vscode.CodeLensProvider {
  private reviews = new Map<string, LastReviewState>();

  public update(state: LastReviewState): void {
    this.reviews.set(path.normalize(state.filePath), state);
  }

  public clear(): void {
    this.reviews.clear();
  }

  public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const config = vscode.workspace.getConfiguration('qaBrain');
    if (!config.get<boolean>('showCodeLens', true)) return [];
    if (!/\.(spec|test)\.[jt]s$/.test(document.fileName)) return [];

    const state = this.reviews.get(path.normalize(document.fileName));
    const summary = state
      ? `QA Brain Quality: ${state.qualityScore} | Risk: ${state.riskScore} | Findings: ${state.findings}`
      : 'QA Brain: Review this test';

    const top = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
    return [
      new vscode.CodeLens(top, {
        title: summary,
        command: 'qaBrain.reviewCurrentFile',
        arguments: [document.uri],
      }),
      new vscode.CodeLens(top, {
        title: 'Review Again',
        command: 'qaBrain.reviewCurrentFile',
        arguments: [document.uri],
      }),
    ];
  }
}
