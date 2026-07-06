import type { ReviewResult } from '../types/ReviewResult';
import type { ReviewContext } from '../types/ReviewContext';

export interface PRReviewSummary {
  filesReviewed: number;
  criticalFindings: number;
  executionMode: string;
  results: Array<{
    file: string;
    qualityScore: number;
    verdict: string;
    findingsCount: number;
    criticalCount: number;
    findings: ReviewResult['findings'];
  }>;
}

export class PRCommentFormatter {
  private static readonly COMMENT_MARKER = '<!-- qa-cortex-review -->';

  /**
   * Formats the review results into a structured PR comment.
   */
  static formatComment(summary: PRReviewSummary): string {
    const lines: string[] = [];

    lines.push(this.COMMENT_MARKER);
    lines.push('## 🧠 QA Cortex Review\n');

    // Execution mode badge
    lines.push(`> **Execution Mode**: ${summary.executionMode}\n`);

    // Summary stats
    lines.push(`**Files Reviewed**: ${summary.filesReviewed} | **Critical Findings**: ${summary.criticalFindings}\n`);

    // Results table
    lines.push('| File | Score | Verdict | Findings |');
    lines.push('|------|-------|---------|----------|');

    for (const r of summary.results) {
      const verdictIcon = r.verdict === 'Excellent' || r.verdict === 'Good' ? '✅' : '❌';
      const findingSummary = r.criticalCount > 0
        ? `${r.criticalCount} Critical, ${r.findingsCount - r.criticalCount} Other`
        : r.findingsCount > 0
          ? `${r.findingsCount} findings`
          : 'None';
      lines.push(`| \`${r.file}\` | ${r.qualityScore}/100 | ${verdictIcon} ${r.verdict} | ${findingSummary} |`);
    }

    // Critical findings detail section
    const criticalResults = summary.results.filter(r => r.criticalCount > 0);
    if (criticalResults.length > 0) {
      lines.push('\n### ❌ Critical Findings\n');

      for (const r of criticalResults) {
        lines.push(`#### \`${r.file}\`\n`);
        const criticalFindings = r.findings.filter(
          f => f.severity === 'Critical' || f.severity === 'High'
        );
        for (const f of criticalFindings) {
          lines.push(`**${f.title}** (${f.severity})`);
          if (f.evidence) {
            lines.push('```');
            lines.push(f.evidence);
            lines.push('```');
          }
          if (f.recommendation) {
            lines.push(`> **Recommendation**: ${f.recommendation}\n`);
          }
        }
      }
    }

    lines.push('\n---');
    lines.push('*Powered by [QA Cortex](https://github.com/ridvan-byr/qa-cortex) v0.1.0*');

    return lines.join('\n');
  }

  /**
   * Formats a GitHub Step Summary (Actions Summary tab).
   */
  static formatStepSummary(summary: PRReviewSummary): string {
    const lines: string[] = [];

    lines.push('### 🧠 QA Cortex Summary\n');
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Files Reviewed | ${summary.filesReviewed} |`);
    lines.push(`| Critical Findings | ${summary.criticalFindings} |`);
    lines.push(`| Execution Mode | ${summary.executionMode} |`);

    if (summary.results.length > 0) {
      const avgScore = Math.round(
        summary.results.reduce((sum, r) => sum + r.qualityScore, 0) / summary.results.length
      );
      lines.push(`| Average Score | ${avgScore}/100 |`);
    }

    return lines.join('\n');
  }

  /**
   * Returns the marker string used to identify existing QA Cortex comments.
   */
  static getCommentMarker(): string {
    return this.COMMENT_MARKER;
  }
}
