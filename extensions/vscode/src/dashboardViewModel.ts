import * as path from 'path';
import * as vscode from 'vscode';
import { resolveQaCortexRoot } from './extensionPaths';
import type { ReviewRun } from './types';
import { VsCodeLanguageModelProvider } from './lmProvider';

export interface TestDesignCoverage {
  category: string;
  covered: boolean;
  missingCount: number;
}

export interface WorkspaceInsights {
  riskyFiles: { filePath: string; risk: number }[];
  violatedRules: { ruleId: string; count: number }[];
  suggestions: string[];
}

export interface DashboardState {
  activeFilePath?: string;
  activeFileName?: string;
  reviewScope?: 'file' | 'selection';
  contextLimited: boolean;
  framework?: string;
  hasReview: boolean;
  qualityScore: number;
  qualityDelta: number;
  riskScore: number;
  riskDelta: number;
  maintainabilityScore: number;
  maintainabilityDelta: number;
  findings: any[];
  testDesign?: {
    coverageScore: number;
    missingScenarios: any[];
  };
  testDesignCoverage: TestDesignCoverage[];
  insights: WorkspaceInsights;
  apiKey?: string;
  apiProvider?: string;
  apiModel?: string;
  apiEndpoint?: string;
}

export class DashboardViewModel {
  private currentState?: DashboardState;
  private onStateChangedCallbacks: ((state: DashboardState) => void)[] = [];

  constructor(private readonly context: vscode.ExtensionContext) {
    this.resetStateObject();
  }

  public registerOnStateChanged(callback: (state: DashboardState) => void): void {
    this.onStateChangedCallbacks.push(callback);
    if (this.currentState) {
      callback(this.currentState);
    }
  }

  public updateReview(run: ReviewRun): void {
    const filePath = run.filePath;
    const score = run.result.score;

    // 1. Calculate Quality Deltas
    const stateKey = `qaCortex.lastScore.${filePath}`;
    const cached = this.context.workspaceState.get<{
      quality: number;
      risk: number;
      maintainability: number;
    }>(stateKey);

    const currentMaintainability = score.maintainabilityScore ?? 100;
    const prevQuality = cached?.quality ?? score.qualityScore;
    const prevRisk = cached?.risk ?? score.riskScore;
    const prevMaintainability = cached?.maintainability ?? currentMaintainability;

    const qualityDelta = score.qualityScore - prevQuality;
    const riskDelta = score.riskScore - prevRisk;
    const maintainabilityDelta = currentMaintainability - prevMaintainability;

    // Cache current scores
    this.context.workspaceState.update(stateKey, {
      quality: score.qualityScore,
      risk: score.riskScore,
      maintainability: currentMaintainability,
    });

    // 2. Update LRU Workspace Aggregation & Rules Count
    this.updateWorkspaceInsights(filePath, run);

    // 3. Assemble State
    const insights = this.calculateInsights();

    this.currentState = {
      activeFilePath: filePath,
      activeFileName: path.basename(filePath),
      reviewScope: run.reviewScope || 'file',
      contextLimited: run.reviewScope === 'selection',
      framework: run.framework,
      hasReview: true,
      qualityScore: score.qualityScore,
      qualityDelta,
      riskScore: score.riskScore,
      riskDelta,
      maintainabilityScore: currentMaintainability,
      maintainabilityDelta,
      findings: run.result.findings.map((f, index) => ({
        id: `finding-${index}`,
        title: f.title,
        severity: f.severity,
        recommendation: f.recommendation,
        evidence: f.evidence,
      })),
      testDesign: this.currentState?.testDesign,
      testDesignCoverage: this.currentState?.testDesignCoverage || [],
      insights,
    };

    this.notifyStateChanged();
  }

  public async runTestDesign(filePath: string, workspaceRoot: string): Promise<void> {
    try {
      const repoRoot = resolveQaCortexRoot();
      const corePath = path.join(repoRoot, 'dist', 'src');
      
      const { TestDesignEngine } = require(path.join(corePath, 'design', 'TestDesignEngine.js'));
      const { GeminiProvider } = require(path.join(corePath, 'reviewer', 'GeminiProvider.js'));

      const config = vscode.workspace.getConfiguration('qaCortex');
      const apiProvider = config.get<string>('apiProvider', 'Gemini');
      const apiKeySetting = config.get<string>('apiKey', '') || (apiProvider === 'Gemini' ? process.env.GEMINI_API_KEY : '') || process.env.QA_BRAIN_API_KEY || '';
      const apiModel = config.get<string>('apiModel', '');
      const apiEndpoint = config.get<string>('apiEndpoint', '');
      const geminiFallback = new GeminiProvider(apiKeySetting, apiProvider, apiModel, apiEndpoint);
      const lmProvider = new VsCodeLanguageModelProvider(geminiFallback);
      const engine = new TestDesignEngine(workspaceRoot, lmProvider, repoRoot);

      const result = await engine.designTests(filePath);

      if (this.currentState) {
        this.currentState.testDesign = {
          coverageScore: result.coverageScore,
          missingScenarios: (result.missingScenarios || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            description: s.description,
            explanation: s.explanation,
            criticality: s.criticality,
            suggestedTemplate: s.suggestedTemplate,
          }))
        };

        // Populate test design coverage techniques (ISTQB techniques)
        const categories = ['Boundary Value', 'Equivalence Partitioning', 'Security', 'Error Path', 'Data Variation'];
        this.currentState.testDesignCoverage = categories.map(cat => {
          const count = (result.missingScenarios || []).filter((s: any) => s.category === cat).length;
          return {
            category: cat,
            covered: count === 0,
            missingCount: count
          };
        });

        this.notifyStateChanged();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`QA Cortex Test Design failed: ${err.message}`);
    }
  }

  public clearState(): void {
    this.resetStateObject();
    this.notifyStateChanged();
  }

  public getCurrentState(): DashboardState | undefined {
    if (this.currentState) {
      const config = vscode.workspace.getConfiguration('qaCortex');
      const apiProvider = config.get<string>('apiProvider', 'Gemini');
      this.currentState.apiKey = config.get<string>('apiKey', '') || (apiProvider === 'Gemini' ? process.env.GEMINI_API_KEY : '') || process.env.QA_BRAIN_API_KEY || '';
      this.currentState.apiProvider = apiProvider;
      this.currentState.apiModel = config.get<string>('apiModel', '');
      this.currentState.apiEndpoint = config.get<string>('apiEndpoint', '');
    }
    return this.currentState;
  }

  private resetStateObject(): void {
    const insights = this.calculateInsights();
    this.currentState = {
      hasReview: false,
      activeFileName: undefined,
      activeFilePath: undefined,
      reviewScope: undefined,
      contextLimited: false,
      qualityScore: 0,
      qualityDelta: 0,
      riskScore: 0,
      riskDelta: 0,
      maintainabilityScore: 0,
      maintainabilityDelta: 0,
      findings: [],
      testDesign: undefined,
      testDesignCoverage: [],
      insights,
    };
  }

  private updateWorkspaceInsights(filePath: string, run: ReviewRun): void {
    const state = this.context.workspaceState;
    
    let files = state.get<string[]>('qaCortex.reviewedFilesList') || [];
    let scoresMap = state.get<Record<string, { quality: number; risk: number; maintainability: number; findings: string[] }>>('qaCortex.fileScoresMap') || {};
    let rulesCount = state.get<Record<string, number>>('qaCortex.rulesCount') || {};

    // 1. Remove old version of the file's rule violations if it was reviewed before
    if (scoresMap[filePath]) {
      const oldFindings = scoresMap[filePath].findings;
      for (const ruleId of oldFindings) {
        if (rulesCount[ruleId]) {
          rulesCount[ruleId]--;
          if (rulesCount[ruleId] <= 0) delete rulesCount[ruleId];
        }
      }
    }

    // 2. Remove file from the list to re-insert as MRU
    files = files.filter(f => f !== filePath);

    // 3. Add new violations
    const currentFindings = run.result.findings.map(f => {
      const title = f.title.toLowerCase();
      if (title.includes('locator') || title.includes('selector')) return 'Resilient Locators';
      if (title.includes('timeout') || title.includes('sleep')) return 'Auto Waiting';
      if (title.includes('isolation') || title.includes('shared state')) return 'State Isolation';
      if (title.includes('assertion')) return 'Strong Assertions';
      if (title.includes('cleanup') || title.includes('driver')) return 'Resource Cleanup';
      return f.title;
    });

    for (const ruleId of currentFindings) {
      rulesCount[ruleId] = (rulesCount[ruleId] || 0) + 1;
    }

    // 4. Save new scores
    scoresMap[filePath] = {
      quality: run.result.score.qualityScore,
      risk: run.result.score.riskScore,
      maintainability: run.result.score.maintainabilityScore ?? 100,
      findings: currentFindings,
    };

    files.push(filePath);

    // 5. Apply LRU Pruning (limit to 50 reviewed files)
    while (files.length > 50) {
      const prunedFile = files.shift();
      if (prunedFile && scoresMap[prunedFile]) {
        const prunedFindings = scoresMap[prunedFile].findings;
        for (const ruleId of prunedFindings) {
          if (rulesCount[ruleId]) {
            rulesCount[ruleId]--;
            if (rulesCount[ruleId] <= 0) delete rulesCount[ruleId];
          }
        }
        delete scoresMap[prunedFile];
      }
    }

    // 6. Save back to state
    state.update('qaCortex.reviewedFilesList', files);
    state.update('qaCortex.fileScoresMap', scoresMap);
    state.update('qaCortex.rulesCount', rulesCount);
  }

  private calculateInsights(): WorkspaceInsights {
    const state = this.context.workspaceState;
    const files = state.get<string[]>('qaCortex.reviewedFilesList') || [];
    const scoresMap = state.get<Record<string, { quality: number; risk: number; maintainability: number; findings: string[] }>>('qaCortex.fileScoresMap') || {};
    const rulesCount = state.get<Record<string, number>>('qaCortex.rulesCount') || {};

    // 1. Calculate top risky files
    const riskyFiles = files
      .map(file => ({
        filePath: path.basename(file),
        risk: scoresMap[file]?.risk || 0,
      }))
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 3);

    // 2. Calculate top violated rules
    const violatedRules = Object.keys(rulesCount)
      .map(ruleId => ({
        ruleId,
        count: rulesCount[ruleId],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 3. Generate suggestions based on top violations
    const suggestions: string[] = [];
    if (violatedRules.length > 0) {
      const topViolation = violatedRules[0].ruleId;
      if (topViolation === 'Resilient Locators') {
        suggestions.push('💡 Tip: Resilient Locators has high violations. Prefer test-ids or user-facing selectors over absolute XPath.');
      } else if (topViolation === 'Auto Waiting') {
        suggestions.push('💡 Tip: Auto Waiting has high violations. Leverage web-first assertions instead of static sleep statements.');
      } else if (topViolation === 'State Isolation') {
        suggestions.push('💡 Tip: State Isolation violations detected. Ensure test cases clean up their database/session states.');
      }
    }
    if (suggestions.length === 0) {
      suggestions.push('💡 Tip: Review more test files in the workspace to gather quality insights!');
    }

    return { riskyFiles, violatedRules, suggestions };
  }

  private notifyStateChanged(): void {
    if (this.currentState) {
      for (const cb of this.onStateChangedCallbacks) {
        cb(this.currentState);
      }
    }
  }
}
