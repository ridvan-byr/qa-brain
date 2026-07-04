export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Finding {
  title: string;
  description: string;
  severity: Severity;
  evidence: string;
  recommendation: string;
  confidence?: {
    level: number;
    justification: string[];
  };
}

export interface ReviewScore {
  fileCoverage?: number;
  featureCoverage?: number | string;
  qualityScore: number;
  riskScore: number;
  riskLevel?: string;
  riskDetails?: string;
  confidenceScore: number;
  maintainabilityScore?: number;
  qualityChecklist?: {
    pomEncapsulation: boolean;
    resilientLocators: boolean;
    stateIsolation: boolean;
    autoWaiting: boolean;
    strongAssertions: boolean;
  };
  maintainabilityChecklist?: {
    meaninglessWaitAvoided: boolean;
    dryPrinciple: boolean;
    modularLocators: boolean;
  };
}

export interface ReviewResult {
  summary: string;
  findings: Finding[];
  score: ReviewScore;
  strengths: string[];
  improvements: string[];
  observations: string[];
  references: string[];
  finalVerdict: string;
}

export interface ReviewRun {
  filePath: string;
  report: string;
  result: ReviewResult;
  selectionStartLine?: number;
}

export interface LastReviewState {
  filePath: string;
  qualityScore: number;
  riskScore: number;
  findings: number;
  reportPath?: string;
}
