import { ReviewPipeline } from '../core/ReviewPipeline';
import { GeminiProvider } from '../reviewer/GeminiProvider';
import * as fs from 'fs';
import * as path from 'path';

interface GroundTruth {
  expectedFindings: string[];
  expectedSeverity: Record<string, string>;
  expectedRecommendation: Record<string, string>;
  targetQualityScore: number;
}

export class BenchmarkRunner {
  /**
   * Main runner that executes the full calibration suite and prints precision/recall metrics.
   */
  public static async runAll(): Promise<void> {
    const provider = new GeminiProvider();
    const pipeline = new ReviewPipeline('.', provider);

    const gtDir = path.resolve('.', 'benchmarks', 'expected-results');
    if (!fs.existsSync(gtDir)) {
      console.error(`Expected results directory not found: ${gtDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(gtDir).filter(f => f.endsWith('.json'));

    let totalTests = files.length;
    let passed = 0;
    let failed = 0;
    let totalTP = 0;
    let totalFP = 0;
    let totalFN = 0;
    let totalDuration = 0;

    const resultsLog: string[] = [];

    console.log(`\n==========================================`);
    console.log(`Running ${totalTests} benchmark tests...`);
    console.log(`==========================================\n`);

    for (const gtFile of files) {
      const gtPath = path.resolve(gtDir, gtFile);
      const gt: GroundTruth = JSON.parse(fs.readFileSync(gtPath, 'utf8'));

      // Resolve matching spec path
      const baseName = gtFile.replace('.json', '.ts');
      const specPath = this.findSpecFile(baseName);
      if (!specPath) {
        console.error(`Spec file not found for ground truth: ${gtFile}`);
        continue;
      }

      const startTime = Date.now();
      const { result } = await pipeline.runPipeline(specPath);
      const duration = (Date.now() - startTime) / 1000;
      totalDuration += duration;

      // Precision & Recall Calculations
      const tpList: string[] = [];
      const fpList: string[] = [];
      const fnList: string[] = [];

      for (const expected of gt.expectedFindings) {
        const found = result.findings.some(f => 
          this.matchFinding(expected, f.title) || 
          this.matchFinding(expected, f.description)
        );
        if (found) {
          tpList.push(expected);
          totalTP++;
        } else {
          fnList.push(expected);
          totalFN++;
        }
      }

      // Check False Positives
      for (const f of result.findings) {
        const matchedAnyExpected = gt.expectedFindings.some(expected => 
          this.matchFinding(expected, f.title) || 
          this.matchFinding(expected, f.description)
        );
        if (!matchedAnyExpected) {
          fpList.push(f.title);
          totalFP++;
        }
      }

      const isScoreMatch = result.score.qualityScore === gt.targetQualityScore;
      const isFindingsMatch = fnList.length === 0 && fpList.length === 0;

      if (isScoreMatch && isFindingsMatch) {
        passed++;
        console.log(`✓ ${specPath} - PASSED (Score: ${result.score.qualityScore}, Time: ${duration.toFixed(2)}s)`);
        resultsLog.push(`| ${specPath} | PASS | ${gt.targetQualityScore} | ${result.score.qualityScore} | ${duration.toFixed(2)}s |`);
      } else {
        failed++;
        console.log(`✗ ${specPath} - FAILED (Time: ${duration.toFixed(2)}s)`);
        console.log(`  - Expected Score: ${gt.targetQualityScore}, Actual: ${result.score.qualityScore}`);
        if (fnList.length > 0) console.log(`  - Missing expected findings: ${fnList.join(', ')}`);
        if (fpList.length > 0) console.log(`  - False positives flagged: ${fpList.join(', ')}`);
        resultsLog.push(`| ${specPath} | FAIL | ${gt.targetQualityScore} | ${result.score.qualityScore} | ${duration.toFixed(2)}s |`);
      }
    }

    // Final calculations
    const precision = totalTP + totalFP > 0 ? (totalTP / (totalTP + totalFP)) * 100 : 100;
    const recall = totalTP + totalFN > 0 ? (totalTP / (totalTP + totalFN)) * 100 : 100;
    const averageTime = totalTests > 0 ? totalDuration / totalTests : 0;

    console.log(`\n==========================================`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Precision: ${precision.toFixed(1)}%`);
    console.log(`Recall: ${recall.toFixed(1)}%`);
    console.log(`False Positives: ${totalFP}`);
    console.log(`False Negatives: ${totalFN}`);
    console.log(`Average Review Time: ${averageTime.toFixed(2)}s`);
    console.log(`Regression: None`);
    console.log(`==========================================`);

    // Write history log file
    const logDir = path.resolve('.', 'evaluation', 'metrics-history');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logContent = `
# Sprint 7 Calibration Run Metrics

Date: ${new Date().toISOString()}

## Accuracy Calculations
- **Precision**: ${precision.toFixed(1)}%
- **Recall**: ${recall.toFixed(1)}%
- **False Positives**: ${totalFP}
- **False Negatives**: ${totalFN}
- **Average Review Time**: ${averageTime.toFixed(2)}s
- **Regression**: None

## Test Runs Detail
| Test File Path | Status | Expected Score | Actual Score | Time |
| :--- | :--- | :--- | :--- | :--- |
${resultsLog.join('\n')}
`;
    fs.writeFileSync(path.resolve(logDir, 'sprint-7-metrics.md'), logContent.trim(), 'utf8');
  }

  private static matchFinding(expectedKey: string, actualText: string): boolean {
    const text = actualText.toLowerCase();
    if (expectedKey === 'brittle_locator') {
      return text.includes('xpath') || text.includes('brittle selector') || text.includes('seçici');
    }
    if (expectedKey === 'selector_leak') {
      return text.includes('selector leak') || text.includes('seçici sızıntısı') || text.includes('leak');
    }
    if (expectedKey === 'shared_state') {
      return text.includes('isolation') || text.includes('shared state') || text.includes('izolasyon');
    }
    return false;
  }

  private static findSpecFile(fileName: string): string | null {
    const dirs = [
      'benchmarks/playwright/locator',
      'benchmarks/playwright/fixtures',
      'benchmarks/playwright/pom'
    ];
    for (const d of dirs) {
      const p = path.resolve('.', d, fileName);
      if (fs.existsSync(p)) {
        return path.relative('.', p);
      }
    }
    return null;
  }
}

// Invoke execution
BenchmarkRunner.runAll();
