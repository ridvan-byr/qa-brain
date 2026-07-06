import { RepositoryLoader } from '../loader/RepositoryLoader';
import { ContextBuilder } from '../loader/ContextBuilder';
import { KnowledgeRouter } from '../router/KnowledgeRouter';
import type { LLMProvider } from '../reviewer/LLMProvider';
import { ScoringEngine } from '../scorer/ScoringEngine';
import { ReportGenerator } from '../reporter/ReportGenerator';
import type { ReviewResult } from '../types/ReviewResult';

export class ReviewPipeline {
  private loader: RepositoryLoader;
  private knowledgeLoader: RepositoryLoader;
  private builder: ContextBuilder;
  private router: KnowledgeRouter;
  private scorer: ScoringEngine;
  private reporter: ReportGenerator;

  constructor(private rootPath: string, private llm: LLMProvider, private knowledgeRootPath: string = rootPath) {
    this.loader = new RepositoryLoader(rootPath);
    this.knowledgeLoader = new RepositoryLoader(knowledgeRootPath);
    this.builder = new ContextBuilder(this.loader);
    this.router = new KnowledgeRouter();
    this.scorer = new ScoringEngine();
    this.reporter = new ReportGenerator();
  }

  /**
   * Runs the full review pipeline for a target test file.
   */
  public async runPipeline(targetFilePath: string): Promise<{ report: string; result: ReviewResult }> {
    console.log('1. Loading Target File...');
    const targetFileContent = this.loader.readRawFile(targetFilePath);
    if (!targetFileContent) {
      throw new Error(`Target file not found at path: ${targetFilePath}`);
    }

    console.log('2. Building Review Context...');
    const context = this.builder.buildContext(targetFilePath, targetFileContent);

    console.log('3. Routing Knowledge...');
    const mappedRules = this.router.routeKnowledge(context);

    console.log('4. Loading Routed Rule Contents...');
    const ruleContents: string[] = [];
    for (const rulePath of mappedRules) {
      const content = this.knowledgeLoader.readRawFile(rulePath);
      if (content) {
        ruleContents.push(`--- File: ${rulePath} ---\n${content}`);
      }
    }

    console.log('5. Executing LLM Review...');
    const llmOutput = await this.llm.review(context, ruleContents);

    // Deduplicate findings by title and sort deterministically
    const deduplicatedFindings = this.deduplicateFindings(llmOutput.findings, context.targetFile.content);

    console.log('6. Calculating Quality & Risk Scores...');
    const score = this.scorer.calculateScore(context, deduplicatedFindings);

    // Assemble final ReviewResult
    const finalResult: ReviewResult = {
      ...llmOutput,
      findings: deduplicatedFindings,
      score,
      finalVerdict: this.scorer.calculateVerdict(score.qualityScore),
    };

    console.log('7. Generating Final Report...');
    const report = this.reporter.generateMarkdown(finalResult, context);

    return {
      report,
      result: finalResult,
    };
  }

  private getHigherSeverity(sev1: string, sev2: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    const order = ['Low', 'Medium', 'High', 'Critical'];
    const idx1 = order.indexOf(sev1);
    const idx2 = order.indexOf(sev2);
    return (idx2 > idx1 ? sev2 : sev1) as any;
  }

  private deduplicateFindings(findings: any[], fileContent: string): any[] {
    const grouped = new Map<string, any>();

    for (const f of findings) {
      const key = f.title.trim();
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.evidence = `${existing.evidence}\n  ${f.evidence}`;
        existing.severity = this.getHigherSeverity(existing.severity, f.severity);
        existing.confidence.level = Math.max(existing.confidence.level || 0, f.confidence?.level || 0);
        existing.confidence.justification = Array.from(new Set([
          ...(existing.confidence.justification || []),
          ...(f.confidence?.justification || [])
        ]));
      } else {
        grouped.set(key, {
          ...f,
          confidence: {
            ...f.confidence,
            justification: [...(f.confidence?.justification || [])]
          }
        });
      }
    }

    const list = Array.from(grouped.values());

    const findLineOfEvidence = (evidence: string): number => {
      if (!evidence) return 999999;
      const firstLineOfEvidence = evidence.split('\n')[0].trim().toLowerCase();
      if (!firstLineOfEvidence) return 999999;

      const lines = fileContent.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(firstLineOfEvidence)) {
          return i + 1;
        }
      }
      return 999999;
    };

    return list.sort((a, b) => {
      const lineA = findLineOfEvidence(a.evidence);
      const lineB = findLineOfEvidence(b.evidence);
      if (lineA !== lineB) {
        return lineA - lineB;
      }
      return a.title.localeCompare(b.title);
    });
  }
}
