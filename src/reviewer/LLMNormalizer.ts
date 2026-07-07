import type { ReviewResult } from '../types/ReviewResult';
import type { Finding, FindingCategory } from '../types/Finding';
import type { TestDesignResult, MissingScenario } from '../types/TestDesignResult';

export class LLMNormalizer {
  public static normalizeReviewResult(parsed: any): Omit<ReviewResult, 'score'> {
    const rawFindings = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.findings) ? parsed.findings : []);
    const normalizedFindings: Finding[] = rawFindings.map((f: any) => {
      const getVal = (obj: any, keys: string[]): string => {
        if (!obj) return '';
        for (const k of keys) {
          const lowerK = k.toLowerCase();
          for (const actualKey of Object.keys(obj)) {
            if (actualKey.toLowerCase() === lowerK) {
              const val = obj[actualKey];
              if (typeof val === 'string') return val.trim();
              if (typeof val === 'number') return String(val);
            }
          }
        }
        return '';
      };

      const ruleIdVal = getVal(f, ['ruleId', 'rule_id', 'ruleName', 'rule_name']);
      const titleVal = getVal(f, ['title', 'ruleName', 'rule_name', 'ruleId', 'rule_id']) || 'Unspecified Code Issue';
      const descriptionVal = getVal(f, ['description', 'message']);
      const severityVal = getVal(f, ['severity']);
      const evidenceVal = getVal(f, ['evidence', 'codeEvidence', 'snippet', 'code_evidence']);
      const recommendationVal = getVal(f, ['recommendation', 'suggestion', 'codeCorrection', 'code_correction', 'suggestedAction', 'suggested_action']);

      let confidenceLevel = 80;
      let justification: string[] = [];
      const rawConfidence = f?.confidence;
      if (typeof rawConfidence === 'number') {
        confidenceLevel = rawConfidence;
      } else if (rawConfidence && typeof rawConfidence === 'object') {
        const levelVal = rawConfidence.level;
        if (typeof levelVal === 'number') {
          confidenceLevel = levelVal;
        } else if (typeof levelVal === 'string') {
          confidenceLevel = parseInt(levelVal, 10) || 80;
        }
        if (Array.isArray(rawConfidence.justification)) {
          justification = rawConfidence.justification.map(String);
        }
      }

      return {
        ruleId: ruleIdVal || undefined,
        category: this.normalizeFindingCategory(getVal(f, ['category']), titleVal),
        title: titleVal,
        description: descriptionVal,
        severity: this.normalizeSeverity(severityVal),
        evidence: evidenceVal,
        recommendation: recommendationVal,
        confidence: {
          level: confidenceLevel,
          justification
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
    const rawScenarios = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.missingScenarios) ? parsed.missingScenarios : []);
    const normalizedScenarios: MissingScenario[] = rawScenarios.map((s: any) => {
      const getVal = (obj: any, keys: string[]): string => {
        if (!obj) return '';
        for (const k of keys) {
          const lowerK = k.toLowerCase();
          for (const actualKey of Object.keys(obj)) {
            if (actualKey.toLowerCase() === lowerK) {
              const val = obj[actualKey];
              if (typeof val === 'string') return val.trim();
              if (typeof val === 'number') return String(val);
            }
          }
        }
        return '';
      };

      const idVal = getVal(s, ['id', 'scenarioId', 'scenario_id']);
      const titleVal = getVal(s, ['title', 'name']) || 'Missing Scenario';
      const categoryVal = getVal(s, ['category']);
      const descriptionVal = getVal(s, ['description', 'whatToVerify', 'what_to_verify']);
      const explanationVal = getVal(s, ['explanation', 'qaRationale', 'qa_rationale', 'reason']);
      const criticalityVal = getVal(s, ['criticality', 'severity']);
      const evidenceVal = getVal(s, ['evidence', 'evidenceLine', 'evidence_line']);

      const template = s?.suggestedTemplate || s?.template || {};
      const playwrightTemplate = getVal(template, ['playwright', 'playwrightTemplate', 'playwright_template']);
      const seleniumTemplate = getVal(template, ['selenium', 'seleniumTemplate', 'selenium_template']);

      return {
        id: idVal || `TS_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        title: titleVal,
        category: this.normalizeCategory(categoryVal),
        description: descriptionVal,
        explanation: explanationVal,
        criticality: this.normalizeCriticality(criticalityVal),
        evidence: evidenceVal,
        suggestedTemplate: {
          playwright: playwrightTemplate,
          selenium: seleniumTemplate
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

  private static normalizeFindingCategory(cat: any, title?: string): FindingCategory {
    const c = String(cat || '').toLowerCase().trim();
    if (c === 'brittlelocator' || c.includes('locator') || c.includes('xpath') || c.includes('css')) return 'BrittleLocator';
    if (c === 'hardcodedwait' || c.includes('wait') || c.includes('sleep') || c.includes('timeout')) return 'HardcodedWait';
    if (c === 'sharedstate' || c.includes('shared') || c.includes('isolation')) return 'SharedState';
    if (c === 'missingassertion' || c.includes('assertion') || c.includes('expect')) return 'MissingAssertion';
    if (c === 'selectorleak' || c.includes('leak')) return 'SelectorLeak';
    if (c === 'resourcecleanup' || c.includes('cleanup') || c.includes('quit') || c.includes('close')) return 'ResourceCleanup';
    if (c === 'duplicate' || c.includes('dry')) return 'Duplicate';

    // Try fallback based on title if category is unspecified/unknown
    const t = String(title || '').toLowerCase();
    if (t.includes('xpath') || t.includes('brittle selector') || t.includes('brittle css') || t.includes('locator')) return 'BrittleLocator';
    if (t.includes('waitfortimeout') || t.includes('hardcoded wait') || t.includes('hardcoded sleep') || t.includes('sleep')) return 'HardcodedWait';
    if (t.includes('isolation') || t.includes('shared state') || t.includes('state leak')) return 'SharedState';
    if (t.includes('missing assertion') || t.includes('weak assertion')) return 'MissingAssertion';
    if (t.includes('selector leak') || t.includes('seçici sızıntısı')) return 'SelectorLeak';
    if (t.includes('resource cleanup') || t.includes('quit') || t.includes('close')) return 'ResourceCleanup';
    if (t.includes('duplicate') || t.includes('dry')) return 'Duplicate';

    return 'Unspecified';
  }
}
