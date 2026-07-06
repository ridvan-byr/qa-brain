import * as fs from 'fs';
import * as path from 'path';
import { ReviewPipeline } from './ReviewPipeline.js';
import type { ReviewResult } from '../types/ReviewResult.js';

export interface ScanOptions {
  ignorePatterns?: string[];
  maxFiles?: number;
}

export interface ScanSummary {
  filesReviewed: number;
  verdictStats: {
    Excellent: number;
    Good: number;
    'Needs Improvement': number;
    Poor: number;
  };
  totalCriticalFindings: number;
  averageQualityScore: number;
  results: Array<{
    file: string;
    qualityScore: number;
    verdict: string;
    findingsCount: number;
    criticalCount: number;
    findings: ReviewResult['findings'];
  }>;
}

export class Scanner {
  /**
   * Recursively scans a directory for spec/test files, respecting ignores.
   * Returns a deterministically sorted array of absolute file paths.
   */
  public static scanDirectory(dirPath: string, ignorePatterns: string[] = []): string[] {
    const files: string[] = [];
    this.scanDirRecursive(dirPath, files, ignorePatterns);
    // Deterministic sorting
    return files.sort();
  }

  /**
   * Runs the review pipeline on a list of files and aggregates summary results.
   */
  public static async runScan(
    files: string[],
    pipeline: ReviewPipeline,
    options: ScanOptions = {}
  ): Promise<ScanSummary> {
    const maxFiles = options.maxFiles || 30;
    const ignorePatterns = options.ignorePatterns || [];
    
    // Apply limit
    const targetFiles = files
      .filter(file => this.isReviewableTestFile(path.basename(file)))
      .slice(0, maxFiles);

    const summary: ScanSummary = {
      filesReviewed: targetFiles.length,
      verdictStats: { Excellent: 0, Good: 0, 'Needs Improvement': 0, Poor: 0 },
      totalCriticalFindings: 0,
      averageQualityScore: 0,
      results: [],
    };

    let totalScoreSum = 0;

    for (const file of targetFiles) {
      const { result } = await pipeline.runPipeline(file);
      const criticalCount = result.findings.filter(
        (f: any) => f.severity === 'Critical' || f.severity === 'High'
      ).length;

      summary.results.push({
        file: path.relative('.', file),
        qualityScore: result.score.qualityScore,
        verdict: result.finalVerdict,
        findingsCount: result.findings.length,
        criticalCount,
        findings: result.findings,
      });

      const verdict = result.finalVerdict as keyof typeof summary.verdictStats;
      if (verdict in summary.verdictStats) {
        summary.verdictStats[verdict]++;
      }
      summary.totalCriticalFindings += criticalCount;
      totalScoreSum += result.score.qualityScore;
    }

    if (summary.filesReviewed > 0) {
      summary.averageQualityScore = Math.round(totalScoreSum / summary.filesReviewed);
    }

    return summary;
  }

  /**
   * Recursive directory walker with ignore pattern filter
   */
  private static scanDirRecursive(dirPath: string, files: string[], ignorePatterns: string[]): void {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Calculate path relative to execution root to match ignores
      const relativePath = path.relative('.', fullPath);

      if (this.matchesIgnorePattern(relativePath, ignorePatterns)) {
        continue;
      }

      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
          this.scanDirRecursive(fullPath, files, ignorePatterns);
        }
      } else if (entry.isFile() && this.isTestFile(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  public static isTestFile(filename: string): boolean {
    const lower = filename.toLowerCase();
    const isJsTsTest = /\.(spec|test)\.(ts|js|tsx|jsx)$/.test(lower)
      || /^tests?\.(ts|js|tsx|jsx)$/.test(lower);

    const isPythonTest = this.isPythonTestFile(lower);

    return isJsTsTest || isPythonTest;
  }

  public static isPythonTestFile(filename: string): boolean {
    const lower = filename.toLowerCase();
    return lower.endsWith('.py') && (
      lower.startsWith('test_') ||
      lower.endsWith('_test.py') ||
      lower === 'test.py' ||
      lower.includes('.spec.py') ||
      lower.includes('.test.py')
    );
  }

  public static isReviewableTestFile(filename: string): boolean {
    return this.isTestFile(filename) && !this.isPythonTestFile(filename);
  }

  /**
   * Helper that checks if path matches any glob ignore patterns.
   */
  private static matchesIgnorePattern(filename: string, patterns: string[]): boolean {
    const normalizedName = filename.replace(/\\/g, '/');
    for (const pattern of patterns) {
      const normalizedPattern = pattern.replace(/\\/g, '/');
      const regex = this.globToRegex(normalizedPattern);

      if (regex.test(normalizedName)) {
        return true;
      }
    }
    return false;
  }

  private static globToRegex(glob: string): RegExp {
    // 1. Replace glob wildcards with safe placeholders FIRST
    let regexStr = glob
      .replace(/\*\*\//g, '{{GLOBSTAR_SLASH}}')
      .replace(/\/\*\*/g, '{{SLASH_GLOBSTAR}}')
      .replace(/\*\*/g, '{{GLOBSTAR}}')
      .replace(/\*/g, '{{STAR}}');

    // 2. Escape remaining regex special characters
    regexStr = regexStr.replace(/\./g, '\\.');

    // 3. Replace placeholders with actual regex patterns
    regexStr = regexStr
      .replace(/\{\{GLOBSTAR_SLASH\}\}/g, '(?:^|.*?\\/)')
      .replace(/\{\{SLASH_GLOBSTAR\}\}/g, '(?:\\/.*)?')
      .replace(/\{\{GLOBSTAR\}\}/g, '.*')
      .replace(/\{\{STAR\}\}/g, '[^/]*');

    return new RegExp(`^${regexStr}$`);
  }
}
