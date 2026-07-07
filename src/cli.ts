#!/usr/bin/env node
import { ReviewPipeline } from './core/ReviewPipeline.js';
import { GeminiProvider } from './reviewer/GeminiProvider.js';
import { BenchmarkRunner } from './evaluation/BenchmarkRunner.js';
import { ValidationRunner } from './evaluation/ValidationRunner.js';
import { RepositoryLoader } from './loader/RepositoryLoader.js';
import { ContextBuilder } from './loader/ContextBuilder.js';
import { KnowledgeRouter } from './router/KnowledgeRouter.js';
import { Scanner } from './core/Scanner.js';
import { AIInstructionExporter } from './core/AIInstructionExporter.js';
import { SarifExporter } from './reporter/SarifExporter.js';
import * as fs from 'fs';
import * as path from 'path';

function printHelp(): void {
  console.log(`
QA Cortex CLI - v0.2.0
Usage: qa-cortex <command> [options]

Commands:
  review <path>     Scan a test file or directory for Playwright rules and score it.
  benchmark         Run the calibration benchmark suite.
  validate [config] Run real repository validation from a validation config.
  init-rules [path] Export QA Cortex rules to AI editor configuration files (.cursorrules, .agents/AGENTS.md, etc).

Options:
  -h, --help        Show this help message.
  -v, --version     Show version number.
  --format <type>   Output format: markdown (default), json, or sarif.
  --output <dir>    Directory to save reports (default: reviews/).
  --provider <name> LLM provider name (default: gemini).
  --config <path>   Path to configuration file.
  --verbose         Print verbose debug information during run.
  --fail-under <score> Fail the review run (exit code 1) if quality score drops below this threshold.

Examples:
  qa-cortex review benchmarks/playwright/locator/xpath.spec.ts
  qa-cortex review benchmarks/playwright/
  qa-cortex review . --verbose
  qa-cortex review . --fail-under 70
  qa-cortex benchmark
  qa-cortex validate validation/repositories.json
  qa-cortex init-rules .
  `);
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('QA Cortex v0.2.0');
    process.exit(0);
  }

  const command = args[0];

  if (command === 'benchmark') {
    await BenchmarkRunner.runAll();
    process.exit(0);
  }

  if (command === 'validate') {
    await ValidationRunner.run(args[1]);
    process.exit(0);
  }

  if (command === 'init-rules') {
    const targetPath = args[1] || '.';
    try {
      AIInstructionExporter.exportRules(targetPath);
      console.log('\nRules successfully exported! AI editors (Cursor, Windsurf, Copilot, Antigravity) opened in the target project will now follow QA Cortex standards.');
      process.exit(0);
    } catch (err: any) {
      console.error(`Error: Failed to export rules: ${err.message}`);
      process.exit(1);
    }
  }

  if (command === 'review') {
    const targetPath = args[1];
    if (!targetPath) {
      console.error('Error: Please specify a file or directory path to review.');
      printHelp();
      process.exit(1);
    }

    // Parse options
    let format = 'markdown';
    let outputDir = 'reviews';
    let providerName = 'gemini';
    let configPath = '';
    let verbose = false;
    let failUnder: number | undefined = undefined;

    // Helper parser
    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--format') format = args[++i];
      else if (args[i] === '--output') outputDir = args[++i];
      else if (args[i] === '--provider') providerName = args[++i];
      else if (args[i] === '--config') configPath = args[++i];
      else if (args[i] === '--verbose') verbose = true;
      else if (args[i] === '--fail-under') failUnder = Number(args[++i]);
    }

    // Load configuration file if present
    let ignorePatterns: string[] = [];
    if (configPath && fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.format) format = config.format;
        if (config.output) outputDir = config.output;
        if (config.provider) providerName = config.provider;
        if (config.verbose) verbose = config.verbose;
        if (config.ignore) ignorePatterns = config.ignore;
        if (config.failUnder !== undefined) failUnder = Number(config.failUnder);
      } catch (err: any) {
        console.error(`Warning: Failed to parse config file: ${err.message}`);
      }
    }

    if (providerName !== 'gemini') {
      console.error(`Error: Unsupported provider "${providerName}". Currently supported providers: gemini.`);
      process.exit(1);
    }

    const absPath = path.resolve(targetPath);
    if (!fs.existsSync(absPath)) {
      console.error(`Error: Path does not exist: ${targetPath}`);
      process.exit(1);
    }

    const stats = fs.statSync(absPath);
    let filesToScan: string[] = [];

    if (stats.isFile()) {
      if (!Scanner.isReviewableTestFile(path.basename(absPath))) {
        console.error(`Error: File is not a supported reviewable test file: ${targetPath}`);
        process.exit(1);
      }
      filesToScan.push(absPath);
    } else {
      // Use the newly abstracted Scanner
      filesToScan = Scanner.scanDirectory(absPath, ignorePatterns)
        .filter(file => Scanner.isReviewableTestFile(path.basename(file)));
    }

    if (filesToScan.length === 0) {
      console.log('No spec files found to review.');
      process.exit(0);
    }

    console.log(`Scanning repository...`);
    console.log(`Found ${filesToScan.length} spec files to review.\n`);

    const provider = new GeminiProvider();
    const pipeline = new ReviewPipeline('.', provider);

    const verdictStats = {
      Excellent: 0,
      Good: 0,
      'Needs Improvement': 0,
      Poor: 0,
    };
    let totalCriticalFindings = 0;
    let index = 1;
    let minQualityScore = 100;
    const allResults: { file: string; content: string; result: any }[] = [];

    for (const file of filesToScan) {
      const relPath = path.relative('.', file);
      console.log(`[${index}/${filesToScan.length}] ${relPath} analiz ediliyor...`);
      
      const fileContent = fs.readFileSync(file, 'utf8');
      const startTime = Date.now();
      const { report, result } = await pipeline.runPipeline(file);
      const durationMs = Date.now() - startTime;

      allResults.push({ file, content: fileContent, result });

      if (result.score.qualityScore < minQualityScore) {
        minQualityScore = result.score.qualityScore;
      }

      if (verbose) {
        const context = new ContextBuilder(new RepositoryLoader('.')).buildContext(file, fileContent);
        const mappedRules = new KnowledgeRouter().routeKnowledge(context);
        
        console.log(`  [VERBOSE DEBUG]`);
        console.log(`  - Provider: ${providerName}`);
        console.log(`  - Rules Loaded: ${mappedRules.length} rules active`);
        console.log(`  - Quality Score: ${result.score.qualityScore}/100`);
        console.log(`  - Risk Level: ${result.score.riskLevel}`);
        console.log(`  - Time Elapsed: ${durationMs}ms`);
        console.log(`  - Findings Flagged: ${result.findings.length}`);
      }

      // Increment stats
      const verdict = result.finalVerdict as keyof typeof verdictStats;
      if (verdict in verdictStats) {
        verdictStats[verdict]++;
      }
      totalCriticalFindings += result.findings.filter(f => f.severity === 'Critical' || f.severity === 'High').length;

      // Save report
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileBase = path.basename(file).replace(/\.[^.]+$/, '');
      if (format === 'json') {
        const outPath = path.join(outputDir, `${fileBase}-review.json`);
        fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
      } else if (format === 'markdown') {
        const outPath = path.join(outputDir, `${fileBase}-review.md`);
        fs.writeFileSync(outPath, report, 'utf8');
      }

      index++;
    }

    // Save consolidated SARIF report if requested
    if (format === 'sarif') {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const sarifContent = SarifExporter.generateSarif(allResults);
      const outPath = path.join(outputDir, `qa-cortex-report.sarif`);
      fs.writeFileSync(outPath, sarifContent, 'utf8');
      console.log(`Saved consolidated SARIF report to: ${outPath}`);
    }

    // Print Repository Summary
    console.log(`\n==========================================`);
    console.log(`Repository Summary`);
    console.log(`==========================================`);
    console.log(`Files Reviewed: ${filesToScan.length}`);
    console.log(`- Excellent: ${verdictStats.Excellent}`);
    console.log(`- Good: ${verdictStats.Good}`);
    console.log(`- Needs Improvement: ${verdictStats['Needs Improvement']}`);
    console.log(`- Poor: ${verdictStats.Poor}`);
    console.log(`- Critical/High Findings: ${totalCriticalFindings}`);
    console.log(`==========================================`);

    // Determine exit code
    if (failUnder !== undefined) {
      if (minQualityScore < failUnder) {
        console.error(`\nError: Quality gate failed! Minimum quality score is ${minQualityScore}, which is below the threshold of ${failUnder}.`);
        process.exit(1);
      }
      console.log(`\nQuality gate passed! Minimum quality score is ${minQualityScore} (threshold: ${failUnder}).`);
      process.exit(0);
    }

    const hasPoorOrCritical = verdictStats.Poor > 0 || totalCriticalFindings > 0;
    process.exit(hasPoorOrCritical ? 1 : 0);
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

run().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
