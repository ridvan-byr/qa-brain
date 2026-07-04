import * as path from 'path';
import * as vscode from 'vscode';
import type { Finding, ReviewRun } from './types';

export class ReviewOutput {
  public readonly channel = vscode.window.createOutputChannel('QA Brain');

  public show(run: ReviewRun): void {
    const score = run.result.score;
    this.channel.clear();
    this.channel.appendLine('QA Brain Review');
    this.channel.appendLine(path.basename(run.filePath));
    this.channel.appendLine('');
    this.channel.appendLine(`Quality: ${score.qualityScore}`);
    for (const deduction of this.qualityBreakdown(run)) {
      this.channel.appendLine(`  ${deduction}`);
    }
    this.channel.appendLine(`Issue Severity: ${this.maxIssueSeverity(run)}`);
    this.channel.appendLine(`Feature Risk: ${this.extractFeatureRisk(score.riskDetails)}`);
    this.channel.appendLine(`Overall Risk: ${score.riskLevel || score.riskScore}`);
    if (typeof score.maintainabilityScore === 'number') {
      this.channel.appendLine(`Maintainability: ${score.maintainabilityScore}`);
      for (const deduction of this.maintainabilityBreakdown(run)) {
        this.channel.appendLine(`  ${deduction}`);
      }
    }
    this.channel.appendLine(`Findings: ${run.result.findings.length}`);
    this.channel.appendLine(`Verdict: ${run.result.finalVerdict}`);
    this.channel.appendLine('');

    if (run.result.findings.length === 0) {
      this.channel.appendLine('No findings detected.');
    }

    for (const finding of run.result.findings) {
      this.writeFinding(finding);
    }

    if (run.result.references.length > 0) {
      this.channel.appendLine('');
      this.channel.appendLine('References:');
      for (const ref of run.result.references) {
        this.channel.appendLine(`- ${this.expandReference(ref)}`);
      }
    }

    this.channel.show(true);
  }

  public dispose(): void {
    this.channel.dispose();
  }

  private writeFinding(finding: Finding): void {
    this.channel.appendLine('----------------');
    this.channel.appendLine(this.outputSeverity(finding.severity));
    this.channel.appendLine(`Rule: ${this.inferRuleId(finding.title, finding.description)}`);
    this.channel.appendLine(finding.title);
    this.channel.appendLine(`Evidence: ${finding.evidence}`);
    this.channel.appendLine('Recommendation:');
    this.channel.appendLine(finding.recommendation);
  }

  private outputSeverity(severity: string): string {
    if (severity === 'Critical' || severity === 'High') return 'ERROR';
    if (severity === 'Medium') return 'WARNING';
    return 'INFO';
  }

  private qualityBreakdown(run: ReviewRun): string[] {
    const checklist = run.result.score.qualityChecklist;
    if (!checklist) return [];
    const deductions: string[] = [];
    if (!checklist.pomEncapsulation) deductions.push('-20 POM encapsulation bypass');
    if (!checklist.resilientLocators) deductions.push('-20 Brittle locator usage');
    if (!checklist.stateIsolation) deductions.push('-20 Test isolation issue');
    if (!checklist.autoWaiting) deductions.push('-15 Hardcoded wait usage');
    if (!checklist.strongAssertions) deductions.push('-20 Missing or weak assertion');
    return deductions;
  }

  private maintainabilityBreakdown(run: ReviewRun): string[] {
    const checklist = run.result.score.maintainabilityChecklist;
    if (!checklist) return [];
    const deductions: string[] = [];
    if (!checklist.meaninglessWaitAvoided) deductions.push('-25 Meaningless wait usage');
    if (!checklist.dryPrinciple) deductions.push('-20 Duplication signal');
    if (!checklist.modularLocators) deductions.push('-25 Non-modular locator usage');
    return deductions;
  }

  private maxIssueSeverity(run: ReviewRun): string {
    const order = ['Low', 'Medium', 'High', 'Critical'];
    let max = 'Low';
    for (const finding of run.result.findings) {
      if (order.indexOf(finding.severity) > order.indexOf(max)) {
        max = finding.severity;
      }
    }
    return max;
  }

  private extractFeatureRisk(riskDetails?: string): string {
    const match = riskDetails?.match(/Feature Risk:\s*([^*]+)\*/);
    return match ? match[1].trim() : 'Unknown';
  }

  private inferRuleId(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('xpath')) return 'LOCATOR_001';
    if (text.includes('css selector') || text.includes('nth-child')) return 'LOCATOR_002';
    if (text.includes('selector leak')) return 'POM_001';
    if (text.includes('waitfortimeout') || text.includes('hardcoded timeout')) return 'WAITING_001';
    if (text.includes('shared state') || text.includes('isolation')) return 'FIXTURE_001';
    if (text.includes('missing assertion')) return 'ASSERTION_001';
    return 'GENERAL_001';
  }

  private expandReference(reference: string): string {
    const map: Record<string, string> = {
      'locator-review.md': 'knowledge/playwright/review-rules/locator-review.md',
      'waiting-review.md': 'knowledge/playwright/review-rules/waiting-review.md',
      'isolation-review.md': 'knowledge/playwright/review-rules/isolation-review.md',
      'assertion-review.md': 'knowledge/playwright/review-rules/assertion-review.md',
    };
    return map[reference] || reference;
  }
}
