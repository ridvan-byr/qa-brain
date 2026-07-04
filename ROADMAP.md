# QA Brain Roadmap

QA Brain is an AI-powered Quality Engineering engine designed to perform whole-project evaluations on test automation repositories, producing senior-level QA audit reports.

This roadmap details completed sprints and outlines the path toward building the core engine and its various client integrations.

---

## Product Milestones

| Milestone | Focus | Status |
| :--- | :--- | :--- |
| v0.1 | CLI foundation | Completed |
| v0.2 | GitHub Action and MCP integrations | Completed |
| v0.3 | VS Code Client | Completed |
| v1.0 | Playwright Stable | Planned |
| v2.0 RC | Playwright + Selenium WebDriver for Node.js release candidate | Planned |
| v2.0 Stable | Playwright + Selenium stable quality gates complete | Planned |
| v3.0 | Test Design Engine | Planned |
| v4.0 | Coverage Intelligence | Planned |
| v5.0 | Quality Engineering Platform | Planned |

Framework support labels are defined in `docs/framework-support-policy.md`.

---

## Roadmap Overview

```
                                 QA Brain
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
[Completed Sprints]                                      [Future Coding Sprints]
  ✓ Sp 1-2: Knowledge Base                                  ⬜ Sp 7: Calibration & Benchmarks
  ✓ Sp 3-4: Review Logic                                    ⬜ Sp 8: CLI Development
  ✓ Sp 5A: Repository Intelligence                          ⬜ Sp 9: GitHub Action Integration
  ✓ Sp 5B: Architecture Intelligence                        ⬜ Sp 10: MCP Server Protocol
  ✓ Sp 6: Core Engine                                       ⬜ v1.0: Stable Release
```

---

## Completed Sprints

### ✅ Sprint 1 & 2 — Knowledge Base
- [x] ISTQB Test Design Techniques (BVA, Equivalence Partitioning).
- [x] Google Testing Practices (Test Smells, Flakiness Mitigation).
- [x] OWASP Security Verification & Injection Test Data.
- [x] Microsoft Testing Playbook (Data Variation, Failure Paths).
- [x] Unicode & W3C Internationalization Standards.

### ✅ Sprint 3 & 4 — Review Logic
- [x] General Review Principles (10 Golden Rules).
- [x] Multi-dimensional Scoring Engines (Coverage, Quality, Risk, Confidence).
- [x] Structured Report Layout Specification (`response-format.md`).

### ✅ Sprint 5A — Repository Intelligence
- [x] Modular repository analysis structure (`brain/repository/`).
- [x] Dependency scanning rules (`package.json`).
- [x] Global configuration scanning rules (`playwright.config.ts`).
- [x] Prioritized loading orchestration (`repository-loading.md`).
- [x] Self-testing harness for engine validation (`tests/`).

### ✅ Sprint 5B — Architecture Intelligence
- [x] Page Object Model (POM) encapsulation and Selector Leak detection rules.
- [x] State isolation, global mutable state, and context sharing detection rules.
- [x] Deterministic review sequence mapping (`repository-review-flow.md`).
- [x] Integrated Mandatory Code Evidence and Architecture Confidence scores.

### ✅ Sprint 6 — Core Engine
- [x] Developed the core QA Brain engine code to dynamically read, load, and execute review rules and prompts.
- [x] Implemented decoupled ReviewPipeline, neutral ContextBuilder, and Gemini LLM provider.
- [x] Decoupled mathematical ScoringEngine and ReportGenerator.

### ✅ Sprint 7 — Calibration & Benchmark Suite
- [x] Established programmatic evaluation and benchmark dataset under `benchmarks/`.
- [x] Coded `BenchmarkRunner.ts` to calculate Precision, Recall, and False Positives.
- [x] Integrated rule-routing optimization stats and millisecond-based execution tracking.
- [x] Calibrated findings deduplication and css/xpath resilient locator checks.

---

## Future Roadmap

### ✅ Sprint 8 — CLI & Real Repository Scanning
- [x] CLI entry point (`src/cli.ts`) with `review`, `benchmark`, `--help`, `--version`, `--verbose`, `--format`, `--output`, `--provider`, `--config` support.
- [x] Recursive directory scanning with progress tracking and Repository Summary output.
- [x] Exit Code 1 on critical/high findings for CI/CD compatibility.
- [x] TypeScript compilation to `dist/` and global `npm link` registration.
- [x] Professional `README.md` with CLI usage guide, architecture diagram, and benchmark results.

### ✅ Sprint 9 — GitHub Action Integration
- [x] Implemented GitHub Action entry point (`src/action.ts`) utilizing dynamic imports for CommonJS compatibility.
- [x] Created `DiffDetector` with custom glob-to-regex ignore support (`**/generated/**`) to filter changed test files.
- [x] Designed `PRCommentFormatter` supporting PR summaries, detailed findings list, and GitHub Step Summaries.
- [x] Packaged with branding, inputs (max-files, ignore), and outputs in `action.yml`.
- [x] Added automated integration tests under `tests/action-integration/`.

### ✅ Sprint 10 — MCP Server Integration
- [x] Created `Scanner.ts` shared module with deterministic sorting, glob-based ignore patterns, and repository scan aggregation.
- [x] Implemented MCP Server (`src/mcp.ts`) with stdio transport: `review_file`, `review_repository`, `run_benchmark` tools.
- [x] Rich tool descriptions optimized for AI agent discovery (Cursor, Claude Desktop, Antigravity).
- [x] Dynamic version reading from `package.json`.
- [x] Refactored `cli.ts` to use shared `Scanner` module (code deduplication).
- [x] Fixed `globToRegex` placeholder bug across `Scanner` and `DiffDetector`.

### ✅ Sprint 11 — Real Repository Validation
- **Objective**: Run QA Brain on 10+ open-source Playwright repos and measure real-world Precision/Recall.
- **Status**: Completed.
- [x] Created validation workspace under `validation/`.
- [x] Added `ValidationRunner` for repository selection checks, rule coverage, review time, and finding triage reports.
- [x] Added `qa-brain validate [config]` CLI command and `npm run validate` script.
- [x] Selected and cloned 10 open-source Playwright repositories locally for the initial validation run.
- [x] Generated initial Rule Only validation report: 10 repositories, 226 files reviewed, 59 findings, 13 rule coverage entries.
- [x] Calibrated noisy assertion/isolation heuristics and reduced findings from 59 to 26 while keeping benchmark suite green.
- [x] Added framework/demo path-aware Missing Assertion filtering and reduced findings from 26 to 5 while keeping benchmark suite green.
- [x] Flagged no-spec repositories as excluded from active validation coverage.
- [x] Completed manual triage for the final 5 findings: 2 true positives, 2 observation candidates, 1 rule improvement candidate, 0 clear false positives.
- [x] Added benchmark cases for fixture-heavy reset flows and DB/API-adjacent tests without result assertions.
- [x] Downgraded demo/example missing assertion signals and reduced active findings from 5 to 2.
- [x] Converted final triage outcomes into benchmarks, rule improvement backlog, or documented justification.
- [x] Replaced no-spec small repository with `microsoft/playwright-mcp`; final validation covers 10 repositories and 229 files.
- [x] Published final Sprint 11 validation report and v0.9 RC recommendation.

Follow-up after Sprint 11:
- Add per-test-block assertion analysis instead of file-level assertion detection.
- Run LLM provider comparison after OpenAI/Gemini/Claude API usage is available.

### ✅ Sprint 12 — VS Code Client
- **Objective**: Provide native VS Code client integration for rule-only Playwright test review feedback.
- **Status**: Completed.
- [x] Planned VS Code Client MVP scope in `docs/implementation-plan.md`.
- [x] Created isolated extension package under `extensions/vscode`.
- [x] Added rule-only review integration using the existing QA Brain core pipeline.
- [x] Added commands for current file, selection, changed files, latest report, and diagnostics clearing.
- [x] Added Problems panel diagnostics, Output Channel report, Status Bar, and CodeLens support.
- [x] Added config defaults for `reviewOnSave`, `openReportAfterReview`, diagnostics, CodeLens, and Status Bar.
- [x] Added graceful review error handling with user-facing notifications.
- [x] Verified Extension Development Host smoke test on local VS Code setup.
- [x] Completed final build/test/benchmark validation with no regression.

### ✅ Sprint 13A — Core Adapter & Signal Architecture
- **Objective**: Prepare QA Brain core for framework adapters without changing current Playwright behavior.
- **Status**: Completed.
- [x] Add small `FrameworkAdapter` API.
- [x] Add `FrameworkSignal` and `FrameworkContext` types.
- [x] Add adapter registry.
- [x] Add initial Playwright bridge adapter without changing review behavior.
- [x] Add automated adapter registry smoke test.
- [x] Keep current Playwright benchmark suite green.
- [x] Run Sprint 11 validation smoke after adapter integration.
- [x] Run VS Code Client compile smoke after adapter integration.
- [x] Run VS Code Extension Development Host smoke after adapter integration.

Out of scope:
- Selenium full support.
- Package/plugin split.
- Cypress/WebdriverIO/Appium support.
- Test Design Engine.
- Marketplace publish.

### ✅ Sprint 13B — Playwright Adapter Migration + Generic Rules
- **Objective**: Move current Playwright behavior behind the adapter layer and separate generic QA rules from framework-specific rules.
- **Status**: Completed.
- [x] Migrate Playwright routing signals into `PlaywrightAdapter`.
- [x] Route Playwright knowledge from `FrameworkSignal` when available.
- [x] Preserve heuristic fallback when framework signals are unavailable.
- [x] Separate generic rules from Playwright-specific rules through `RuleMapping`.
- [x] Add rule mapping and architecture validation notes.
- [x] Preserve existing Playwright benchmark output semantics.
- [x] Preserve existing CLI, GitHub Action, MCP, and VS Code Client behavior.
- [x] Keep benchmark suite and validation smoke green.

Architecture Freeze milestone before Sprint 13C:
- [x] Run one focused dependency and routing review before Selenium implementation starts.
- [x] Do not add new product features during this milestone.
- [x] Publish `docs/architecture-freeze-sprint-13.md`.

### ✅ Sprint 13C — Selenium WebDriver Adapter
- **Objective**: Integrate Selenium WebDriver for Node.js as the second framework adapter while preserving QA Brain's generic rule model and Playwright output stability.
- **Status**: Completed.
- [x] Document architecture principles for framework-independent QA rules.
- [x] Detect Selenium WebDriver for Node.js projects.
- [x] Build Selenium locator, assertion, wait, lifecycle, and structure signals.
- [x] Add initial Selenium framework evidence and rule mapping seeds.
- [x] Add Selenium benchmark seed cases.
- [x] Preserve semantic equivalence for existing Playwright benchmark outputs.
- [x] Keep Playwright regression suite green.
- [x] Document Selenium support level as foundation with seed benchmarks.

### ⬜ Sprint 13D — Selenium Calibration & Validation
- **Objective**: Calibrate and validate Selenium adapter and rules against real repositories.
- **Status**: Planned.
- [ ] Select real Selenium WebDriver for Node.js repositories.
- [ ] Run rule-only validation.
- [ ] Triage false positives and false negatives.
- [ ] Feed validated findings back into benchmarks.
- [ ] Publish `validation/reports/selenium-calibration-report.md`.
- [ ] Publish `validation/metrics/selenium-calibration-metrics.json`.
- [ ] Produce GO / CONDITIONAL GO / NO-GO decision.

### ⬜ v1.0 — Stable Release
- **Objective**: Reach production stability with validated accuracy metrics and full documentation.
