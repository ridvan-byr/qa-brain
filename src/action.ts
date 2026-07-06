import * as path from 'path';
import * as fs from 'fs';
import { DiffDetector } from './github/DiffDetector.js';
import { ReviewPipeline } from './core/ReviewPipeline.js';
import { GeminiProvider } from './reviewer/GeminiProvider.js';
import { PRCommentFormatter, type PRReviewSummary } from './reporter/PRCommentFormatter.js';
import { Scanner } from './core/Scanner.js';

async function run(): Promise<void> {
  // Dynamically import ES modules to run inside CJS build target
  const core = await import('@actions/core');
  const github = await import('@actions/github');

  try {
    // ── 1. Read Action Inputs ──
    const token = core.getInput('github-token', { required: true });
    const geminiApiKey = core.getInput('gemini-api-key');
    const reviewPath = core.getInput('review-path');
    const failOnCritical = core.getInput('fail-on-critical') === 'true';
    const maxFiles = parseInt(core.getInput('max-files') || '30', 10);
    const ignoreInput = core.getInput('ignore');
    const ignorePatterns = ignoreInput ? ignoreInput.split('\n').map(p => p.trim()).filter(Boolean) : [];

    // ── 2. Determine Execution Mode ──
    const hasApiKey = !!geminiApiKey;
    const executionMode = hasApiKey ? '🤖 Gemini 2.5 Flash + Rules' : '📏 Rule Engine Only';
    core.info(`Execution Mode: ${executionMode}`);

    // ── 3. Get PR Context ──
    const context = github.context;
    if (!context.payload.pull_request) {
      core.setFailed('This action can only run on pull_request events.');
      return;
    }

    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const prNumber = context.payload.pull_request.number;

    core.info(`Reviewing PR #${prNumber} in ${owner}/${repo}`);

    // ── 4. Detect Changed Files ──
    let testFiles: string[] = [];
    if (reviewPath) {
      const resolvedReviewPath = path.resolve(reviewPath);
      if (!fs.existsSync(resolvedReviewPath)) {
        core.setFailed(`review-path does not exist: ${reviewPath}`);
        return;
      }

      const stat = fs.statSync(resolvedReviewPath);
      if (stat.isFile()) {
        if (Scanner.isReviewableTestFile(path.basename(resolvedReviewPath))) {
          testFiles = [resolvedReviewPath];
        } else if (Scanner.isPythonTestFile(path.basename(resolvedReviewPath))) {
          core.info('Python test discovery is enabled, but Python review is not enabled yet. Skipping review.');
        }
      } else if (stat.isDirectory()) {
        testFiles = Scanner.scanDirectory(resolvedReviewPath, ignorePatterns)
          .filter(file => Scanner.isReviewableTestFile(path.basename(file)));
      }

      core.info(`Review path: ${reviewPath}`);
      core.info(`Test files to review: ${testFiles.length}`);
    } else {
      const detector = new DiffDetector(token);
      const changedFiles = await detector.getChangedFiles(owner, repo, prNumber);
      testFiles = detector.filterTestFiles(changedFiles, ignorePatterns);

      core.info(`Changed files: ${changedFiles.length}`);
      core.info(`Test files to review: ${testFiles.length}`);
    }

    if (testFiles.length === 0) {
      core.info('No test files found to review. Skipping review.');
      return;
    }

    // ── 5. Apply max-files limit ──
    if (testFiles.length > maxFiles) {
      core.warning(`PR contains ${testFiles.length} test files. Reviewing first ${maxFiles} (max-files limit).`);
      testFiles = testFiles.slice(0, maxFiles);
    }

    // ── 6. Run Review Pipeline ──
    const provider = new GeminiProvider(hasApiKey ? geminiApiKey : undefined);
    const pipeline = new ReviewPipeline('.', provider);

    const summary: PRReviewSummary = {
      filesReviewed: testFiles.length,
      criticalFindings: 0,
      executionMode,
      results: [],
    };

    for (let i = 0; i < testFiles.length; i++) {
      const file = testFiles[i];
      const relPath = path.relative('.', file);
      core.info(`[${i + 1}/${testFiles.length}] Reviewing ${relPath}...`);

      try {
        const { result } = await pipeline.runPipeline(file);

        const criticalCount = result.findings.filter(
          f => f.severity === 'Critical' || f.severity === 'High'
        ).length;

        summary.results.push({
          file: relPath,
          qualityScore: result.score.qualityScore,
          verdict: result.finalVerdict,
          findingsCount: result.findings.length,
          criticalCount,
          findings: result.findings,
        });

        summary.criticalFindings += criticalCount;
      } catch (err: any) {
        core.warning(`Failed to review ${relPath}: ${err.message}`);
      }
    }

    // ── 7. Post PR Comment (create or update) ──
    const octokit = github.getOctokit(token);
    const commentBody = PRCommentFormatter.formatComment(summary);
    const marker = PRCommentFormatter.getCommentMarker();

    // Find existing comment
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
    });

    const existingComment = comments.find((c: { body?: string }) => c.body?.includes(marker));

    if (existingComment) {
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existingComment.id,
        body: commentBody,
      });
      core.info('Updated existing QA Brain comment.');
    } else {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: commentBody,
      });
      core.info('Created new QA Brain comment.');
    }

    // ── 8. GitHub Step Summary ──
    const stepSummary = PRCommentFormatter.formatStepSummary(summary);
    await core.summary.addRaw(stepSummary).write();

    // ── 9. Set Output and Exit Code ──
    core.setOutput('files-reviewed', summary.filesReviewed.toString());
    core.setOutput('critical-findings', summary.criticalFindings.toString());

    if (failOnCritical && summary.criticalFindings > 0) {
      core.setFailed(
        `QA Brain found ${summary.criticalFindings} critical/high finding(s). Review the PR comment for details.`
      );
    } else {
      core.info(`✅ QA Brain review complete. ${summary.filesReviewed} files reviewed, ${summary.criticalFindings} critical findings.`);
    }
  } catch (error: any) {
    core.setFailed(`QA Brain Action failed: ${error.message}`);
  }
}

run();
