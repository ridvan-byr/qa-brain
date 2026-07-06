import type { ReviewResult } from '../types/ReviewResult';
import type { Finding } from '../types/Finding';
import type { TestDesignResult, MissingScenario } from '../types/TestDesignResult';

export class LLMNormalizer {
  public static normalizeReviewResult(parsed: any): Omit<ReviewResult, 'score'> {
    const rawFindings = Array.isArray(parsed?.findings) ? parsed.findings : [];
    const normalizedFindings: Finding[] = rawFindings.map((f: any) => {
      const confidence = f?.confidence || {};
      return {
        title: typeof f?.title === 'string' ? f.title.trim() : 'Unspecified Code Issue',
        description: typeof f?.description === 'string' ? f.description.trim() : '',
        severity: this.normalizeSeverity(f?.severity),
        evidence: typeof f?.evidence === 'string' ? f.evidence.trim() : '',
        recommendation: typeof f?.recommendation === 'string' ? f.recommendation.trim() : '',
        confidence: {
          level: typeof confidence.level === 'number' ? confidence.level : 80,
          justification: Array.isArray(confidence.justification) ? confidence.justification.map(String) : []
        }
      };
    });

    return {
      summary: typeof parsed?.summary === 'string' ? parsed.summary.trim() : 'Code review completed.',
      findings: normalizedFindings,
      strengths: Array.isArray(parsed?.strengths) ? parsed.strengths.map(String) : [],
      improvements: Array.isArray(parsed?.improvements) ? parsed.improvements.map(String) : [],
      observations: Array.isArray(parsed?.observations) ? parsed.observations.map(String) : [],
      references: Array.isArray(parsed?.references) ? parsed.references.map(String) : [],
      finalVerdict: this.normalizeFinalVerdict(parsed?.finalVerdict)
    };
  }

  public static normalizeTestDesignResult(parsed: any, filePath: string, framework: string): TestDesignResult {
    const rawScenarios = Array.isArray(parsed?.missingScenarios) ? parsed.missingScenarios : [];
    const normalizedScenarios: MissingScenario[] = rawScenarios.map((s: any) => {
      const template = s?.suggestedTemplate || {};
      return {
        id: typeof s?.id === 'string' ? s.id.trim() : `TS_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        title: typeof s?.title === 'string' ? s.title.trim() : 'Missing Scenario',
        category: this.normalizeCategory(s?.category),
        description: typeof s?.description === 'string' ? s.description.trim() : '',
        explanation: typeof s?.explanation === 'string' ? s.explanation.trim() : '',
        criticality: this.normalizeCriticality(s?.criticality),
        evidence: typeof s?.evidence === 'string' ? s.evidence.trim() : '',
        suggestedTemplate: {
          playwright: typeof template.playwright === 'string' ? template.playwright : '',
          selenium: typeof template.selenium === 'string' ? template.selenium : ''
        }
      };
    });

    let coverageScore = parsed?.coverageScore;
    if (typeof coverageScore !== 'number' || isNaN(coverageScore)) {
      coverageScore = 50;
    }
    coverageScore = Math.max(0, Math.min(100, coverageScore));

    return {
      fileName: filePath,
      framework: (framework || 'unknown') as any,
      coverageScore,
      missingScenarios: normalizedScenarios
    };
  }

  private static normalizeSeverity(sev: any): 'Critical' | 'High' | 'Medium' | 'Low' {
    const s = String(sev || '').toLowerCase().trim();
    if (s === 'critical') return 'Critical';
    if (s === 'high' || s === 'error') return 'High';
    if (s === 'medium' || s === 'warning' || s === 'warn') return 'Medium';
    return 'Low';
  }

  private static normalizeFinalVerdict(verdict: any): 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor' {
    const v = String(verdict || '').toLowerCase().trim();
    if (v === 'excellent') return 'Excellent';
    if (v === 'good') return 'Good';
    if (v === 'poor') return 'Poor';
    return 'Needs Improvement';
  }

  private static normalizeCategory(cat: any): 'Boundary Value' | 'Equivalence Partitioning' | 'Security' | 'Error Path' | 'Data Variation' {
    const c = String(cat || '').toLowerCase().trim();
    if (c.includes('boundary') || c.includes('bva')) return 'Boundary Value';
    if (c.includes('equivalence') || c.includes('partitioning') || c.includes('ecp')) return 'Equivalence Partitioning';
    if (c.includes('security')) return 'Security';
    if (c.includes('error') || c.includes('failure')) return 'Error Path';
    if (c.includes('data') || c.includes('variation')) return 'Data Variation';
    return 'Equivalence Partitioning';
  }

  private static normalizeCriticality(crit: any): 'HIGH' | 'MEDIUM' | 'LOW' {
    const c = String(crit || '').toUpperCase().trim();
    if (c === 'HIGH' || c === 'CRITICAL') return 'HIGH';
    if (c === 'MEDIUM' || c === 'WARN') return 'MEDIUM';
    return 'LOW';
  }
}
