import * as vscode from 'vscode';
import type { Finding, ReviewRun, Severity } from './types';

export class DiagnosticManager {
  private readonly collection = vscode.languages.createDiagnosticCollection('QA Brain');

  public setDiagnostics(document: vscode.TextDocument, run: ReviewRun): void {
    const diagnostics = run.result.findings.map(finding => this.toDiagnostic(document, run, finding));
    this.collection.set(document.uri, diagnostics);
  }

  public clear(): void {
    this.collection.clear();
  }

  public dispose(): void {
    this.collection.dispose();
  }

  private toDiagnostic(document: vscode.TextDocument, run: ReviewRun, finding: Finding): vscode.Diagnostic {
    const line = this.findEvidenceLine(document, finding.evidence, run.selectionStartLine);
    const range = new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, Math.max(1, document.lineAt(line).text.length))
    );
    const diagnostic = new vscode.Diagnostic(
      range,
      `${finding.title}: ${finding.recommendation}`,
      this.mapSeverity(finding.severity)
    );
    diagnostic.source = 'QA Brain';
    diagnostic.code = finding.severity;
    return diagnostic;
  }

  private findEvidenceLine(document: vscode.TextDocument, evidence: string, selectionStartLine = 0): number {
    const needle = evidence.trim();
    if (!needle) return selectionStartLine;

    const startLine = Math.max(0, selectionStartLine);
    for (let line = startLine; line < document.lineCount; line++) {
      if (document.lineAt(line).text.includes(needle)) {
        return line;
      }
    }

    for (let line = 0; line < document.lineCount; line++) {
      if (document.lineAt(line).text.includes(needle)) {
        return line;
      }
    }

    return startLine;
  }

  private mapSeverity(severity: Severity): vscode.DiagnosticSeverity {
    if (severity === 'Critical' || severity === 'High') return vscode.DiagnosticSeverity.Error;
    if (severity === 'Medium') return vscode.DiagnosticSeverity.Warning;
    return vscode.DiagnosticSeverity.Information;
  }
}
