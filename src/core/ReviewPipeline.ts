import { RepositoryLoader } from '../loader/RepositoryLoader';
import { ContextBuilder } from '../loader/ContextBuilder';
import { KnowledgeRouter } from '../router/KnowledgeRouter';
import type { LLMProvider } from '../reviewer/LLMProvider';
import { ScoringEngine } from '../scorer/ScoringEngine';
import { ReportGenerator } from '../reporter/ReportGenerator';
import type { ReviewResult } from '../types/ReviewResult';

export class ReviewPipeline {
  private loader: RepositoryLoader;
  private builder: ContextBuilder;
  private router: KnowledgeRouter;
  private scorer: ScoringEngine;
  private reporter: ReportGenerator;

  constructor(private rootPath: string, private llm: LLMProvider) {
    this.loader = new RepositoryLoader(rootPath);
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
      const content = this.loader.readRawFile(rulePath);
      if (content) {
        ruleContents.push(`--- File: ${rulePath} ---\n${content}`);
      }
    }

    console.log('5. Executing LLM Review...');
    const llmOutput = await this.llm.review(context, ruleContents);

    // Deduplicate findings by title
    const deduplicatedFindings = this.deduplicateFindings(llmOutput.findings);

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

  private deduplicateFindings(findings: any[]): any[] {
    const grouped = new Map<string, any>();

    for (const f of findings) {
      const key = f.title.trim();
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.evidence = `${existing.evidence}\n  ${f.evidence}`;
        existing.confidence.justification = Array.from(new Set([
          ...existing.confidence.justification,
          ...f.confidence.justification
        ]));
      } else {
        grouped.set(key, {
          ...f,
          confidence: {
            ...f.confidence,
            justification: [...f.confidence.justification]
          }
        });
      }
    }

    return Array.from(grouped.values());
  }
}
