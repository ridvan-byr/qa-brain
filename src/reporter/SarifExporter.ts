import type { ReviewResult } from '../types/ReviewResult';
import * as path from 'path';

export class SarifExporter {
  /**
   * Generates a standard SARIF JSON string from a list of review results.
   */
  public static generateSarif(results: { file: string; content: string; result: ReviewResult }[]): string {
    const rulesMap = new Map<string, any>();
    const sarifResults: any[] = [];

    for (const item of results) {
      const { file, content, result } = item;
      const relPath = path.relative('.', file).replace(/\\/g, '/');

      for (const finding of result.findings) {
        const ruleId = finding.ruleId || 'GENERIC_RULE';
        const category = finding.category || 'Quality';
        
        if (!rulesMap.has(ruleId)) {
          rulesMap.set(ruleId, {
            id: ruleId,
            name: category,
            shortDescription: {
              text: finding.title || 'QA Cortex Rule'
            },
            fullDescription: {
              text: finding.description || ''
            }
          });
        }

        const line = this.findLineOfEvidence(content, finding.evidence);
        
        let level = 'warning';
        if (finding.severity === 'Critical' || finding.severity === 'High') {
          level = 'error';
        } else if (finding.severity === 'Low') {
          level = 'note';
        }

        sarifResults.push({
          ruleId,
          level,
          message: {
            text: `${finding.title}: ${finding.description}\nRecommendation: ${finding.recommendation}`
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: relPath
                },
                region: {
                  startLine: line,
                  startColumn: 1
                }
              }
            }
          ]
        });
      }
    }

    const sarifReport = {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'QA Cortex',
              informationUri: 'https://github.com/ridvan-byr/qa-cortex',
              version: '0.2.0',
              rules: Array.from(rulesMap.values())
            }
          },
          results: sarifResults
        }
      ]
    };

    return JSON.stringify(sarifReport, null, 2);
  }

  private static findLineOfEvidence(fileContent: string, evidence: string): number {
    if (!evidence) return 1;
    const firstLineOfEvidence = evidence.split('\n')[0].trim().toLowerCase();
    if (!firstLineOfEvidence) return 1;

    const lines = fileContent.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(firstLineOfEvidence)) {
        return i + 1;
      }
    }
    return 1;
  }
}
