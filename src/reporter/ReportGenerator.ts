import type { ReviewResult } from '../types/ReviewResult';
import type { ReviewContext } from '../types/ReviewContext';

export class ReportGenerator {
  /**
   * Formats the final ReviewResult object into a structured Markdown report.
   */
  public generateMarkdown(result: ReviewResult, context: ReviewContext): string {
    let report = '';

    report += `# QA Brain Review Report\n\n`;
    report += `## Summary\n\n${result.summary}\n\n---\n\n`;

    report += `## Findings\n\n`;
    if (result.findings.length === 0) {
      report += `No findings detected.\n\n`;
    } else {
      for (const finding of result.findings) {
        report += `### Finding: ${finding.title}\n`;
        report += `- **Rule**: ${this.inferRuleId(finding.title, finding.description)}\n`;
        report += `- **Description**: ${finding.description}\n`;
        report += `- **Issue Severity**: ${finding.severity}\n`;
        report += `- **Confidence**: ${finding.confidence.level}% (${finding.confidence.justification.join(', ')})\n`;
        report += `- **Evidence**:\n  \`\`\`typescript\n  ${finding.evidence}\n  \`\`\`\n`;
        report += `- **Recommendation**: ${finding.recommendation}\n\n`;
      }
    }

    report += `---\n\n## Metrics\n\n`;
    report += `- **File Coverage Score**: ${result.score.fileCoverage}/100\n`;
    const featureCoverage = typeof result.score.featureCoverage === 'number'
      ? `${result.score.featureCoverage}/100`
      : result.score.featureCoverage;
    report += `- **Feature Coverage Score**: ${featureCoverage}\n`;
    report += `- **Quality Score**: ${result.score.qualityScore}/100\n`;
    for (const deduction of this.buildQualityBreakdown(result)) {
      report += `  - ${deduction}\n`;
    }
    report += `  - [${result.score.qualityChecklist.pomEncapsulation ? 'x' : ' '}] POM Encapsulation\n`;
    report += `  - [${result.score.qualityChecklist.resilientLocators ? 'x' : ' '}] Resilient Locators\n`;
    report += `  - [${result.score.qualityChecklist.stateIsolation ? 'x' : ' '}] State Isolation\n`;
    report += `  - [${result.score.qualityChecklist.autoWaiting ? 'x' : ' '}] Auto Waiting\n`;
    report += `  - [${result.score.qualityChecklist.strongAssertions ? 'x' : ' '}] Strong Assertions\n\n`;

    report += `- **Issue Severity**: ${this.maxIssueSeverity(result)}\n`;
    report += `- **Feature Risk**: ${this.extractFeatureRisk(result.score.riskDetails)}\n`;
    report += `- **Overall Risk**: ${result.score.riskLevel} (${result.score.riskDetails})\n`;
    report += `- **Maintainability Score**: ${result.score.maintainabilityScore}/100\n`;
    for (const deduction of this.buildMaintainabilityBreakdown(result)) {
      report += `  - ${deduction}\n`;
    }
    report += `  - [${result.score.maintainabilityChecklist.meaninglessWaitAvoided ? 'x' : ' '}] Meaningless Wait Avoided\n`;
    report += `  - [${result.score.maintainabilityChecklist.dryPrinciple ? 'x' : ' '}] DRY Principle\n`;
    report += `  - [${result.score.maintainabilityChecklist.modularLocators ? 'x' : ' '}] Modular Locators\n\n`;

    report += `---\n\n## Strengths\n\n`;
    const strengths = this.buildStrengths(result, context);
    for (const strength of strengths) {
      report += `- ${strength}\n`;
    }
    if (strengths.length === 0) {
      report += `- No positive signals detected yet.\n`;
    }

    report += `\n---\n\n## Improvements\n\n`;
    for (const improvement of result.improvements) {
      report += `- ${improvement}\n`;
    }
    if (result.improvements.length === 0) report += `None\n`;

    report += `\n---\n\n## Observations\n\n`;
    const observations = [...result.observations];
    if (context.dependencies.playwrightVersion) {
      observations.push(`Repository uses Playwright ${context.dependencies.playwrightVersion}`);
    }
    if (context.pageObjects.length > 0) {
      observations.push(`${context.pageObjects.length} Page Object files mapped`);
    }
    if (context.fixtures.length > 0) {
      observations.push(`${context.fixtures.length} custom fixtures loaded`);
    }
    if (context.targetFile.detectedFeature) {
      observations.push(`Target feature domain mapped: ${context.targetFile.detectedFeature}`);
    }

    for (const observation of observations) {
      report += `- ${observation}\n`;
    }
    if (observations.length === 0) report += `None\n`;

    report += `\n---\n\n## References\n\n`;
    for (const reference of result.references) {
      report += `- ${this.expandReference(reference)}\n`;
    }
    if (result.references.length === 0) report += `None\n`;

    report += `\n---\n\n## Final Verdict\n\n**${result.finalVerdict}**\n`;

    return report;
  }

  private buildStrengths(result: ReviewResult, context: ReviewContext): string[] {
    const strengths = new Set<string>();
    for (const strength of result.strengths) {
      strengths.add(strength);
    }

    if (context.dependencies.playwrightVersion) strengths.add('Uses Playwright');
    if (context.pageObjects.length > 0 && result.score.qualityChecklist.pomEncapsulation) strengths.add('Uses Page Object structure');
    if (result.score.qualityChecklist.autoWaiting) strengths.add('Avoids hardcoded waits');
    if (result.score.qualityChecklist.stateIsolation) strengths.add('Keeps test state isolated');
    if (result.score.qualityChecklist.strongAssertions) strengths.add('Uses strong assertions');
    if (result.score.maintainabilityChecklist.dryPrinciple) strengths.add('Avoids obvious duplication');

    return Array.from(strengths);
  }

  private buildQualityBreakdown(result: ReviewResult): string[] {
    const deductions: string[] = [];
    if (!result.score.qualityChecklist.pomEncapsulation) deductions.push('-20 POM encapsulation bypass');
    if (!result.score.qualityChecklist.resilientLocators) deductions.push('-20 Brittle locator usage');
    if (!result.score.qualityChecklist.stateIsolation) deductions.push('-20 Test isolation issue');
    if (!result.score.qualityChecklist.autoWaiting) deductions.push('-15 Hardcoded wait usage');
    if (!result.score.qualityChecklist.strongAssertions) deductions.push('-20 Missing or weak assertion');
    return deductions;
  }

  private buildMaintainabilityBreakdown(result: ReviewResult): string[] {
    const deductions: string[] = [];
    if (!result.score.maintainabilityChecklist.meaninglessWaitAvoided) deductions.push('-25 Meaningless wait usage');
    if (!result.score.maintainabilityChecklist.dryPrinciple) deductions.push('-20 Duplication signal');
    if (!result.score.maintainabilityChecklist.modularLocators) deductions.push('-25 Non-modular locator usage');
    return deductions;
  }

  private maxIssueSeverity(result: ReviewResult): string {
    const order = ['Low', 'Medium', 'High', 'Critical'];
    let max = 'Low';
    for (const finding of result.findings) {
      if (order.indexOf(finding.severity) > order.indexOf(max)) {
        max = finding.severity;
      }
    }
    return max;
  }

  private extractFeatureRisk(riskDetails: string): string {
    const match = riskDetails.match(/Feature Risk:\s*([^*]+)\*/);
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
