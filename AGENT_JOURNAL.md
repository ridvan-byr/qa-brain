# QA Brain AI Agent Journal & Handoff

This file acts as a shared activity journal to synchronize state and context between different AI assistants (such as Antigravity/Gemini and Codex). Whenever an AI assistant completes a task or session, it should write an entry here.

---

## 2026-07-05 - Antigravity (Gemini 2.5 Flash)

### 1. Completed Sprint 13D: Selenium Calibration & Validation
- **Target Repositories**: Cloned 5 public Selenium Node.js/Mocha/Jest test suites locally under `C:/tmp/qa-brain-validation-repos/` and configured validation paths in `validation/repositories.selenium.json`.
- **Heuristics Calibrated**:
  - `src/core/Scanner.ts`: Extended `isTestFile` to match common Selenium file patterns (like `tests.js` and `test-*.ts`).
  - `src/evaluation/ValidationRunner.ts`: Relaxed `isLikelyFrameworkTest` to identify Selenium tests that abstract WebDriver builders behind custom utility managers (e.g. `DriverLifeCycle`).
  - `src/framework/adapters/SeleniumAdapter.ts`, `src/reviewer/GeminiProvider.ts`, `src/router/KnowledgeRouter.ts`: Added visual testing assertions (`eyes.check()`, `percySnapshot()`) and custom Page Object assertion helper conventions (`.validateXXX`, `.verifyXXX`, `.assertXXX`) to `hasAssertionSignal`.
- **Validation Run Results**:
  - Triage report generated in `validation/reports/selenium-calibration-report.md`.
  - Scanned 9 files, resulting in 2 findings (100% True Positives - brittle CSS chains and inline XPaths in basic hooks).
  - Precision: **100%** (0 false positives).
  - Go Decision: **GO (Selenium Foundation Validated)**.
  - Metrics written to `validation/metrics/selenium-calibration-metrics.json`.
- **Regression Checks**:
  - Playwright integration benchmarks (`BenchmarkRunner.ts`) remain 100% green (12/12 cases passed).
  - Playwright validation smoke (`npm run validate`) passes successfully.
  - Marked Sprint 13D completed in `ROADMAP.md`.

### 2. Completed Sprint 14: Test Design Engine MVP (v3.0 Core)
- **Engine Core**: Created `src/design/TestDesignEngine.ts` and `src/types/TestDesignResult.ts` to scan files and generate structured test design recommendations using BVA, ECP, and security rules.
- **Scenario Explanations**: Implemented detailed educational QA explanations for each missing test case.
- **MCP Tool Integration**: Registered and handled the `generate_test_design` tool in `src/mcp.ts` with comprehensive schema descriptions to enable agent discovery.
- **Integration Tests & Benchmarks**:
  - Created test design benchmark cases (`benchmarks/design/login-form.spec.ts` and `benchmarks/design/feedback-form.spec.ts`).
  - Added full test design suite verification to `tests/action-integration/action.test.ts` (100% passed).
- **Files Modified**:
  - `src/types/TestDesignResult.ts` [NEW]
  - `src/design/TestDesignEngine.ts` [NEW]
  - `benchmarks/design/login-form.spec.ts` [NEW]
  - `benchmarks/design/feedback-form.spec.ts` [NEW]
  - `src/reviewer/LLMProvider.ts` [MODIFY]
  - `src/reviewer/GeminiProvider.ts` [MODIFY]
  - `src/mcp.ts` [MODIFY]
  - `tests/action-integration/action.test.ts` [MODIFY]

### 3. Completed Sprint 15: Framework-Neutral VS Code Client
- **Core Decoupling**: Refactored the VS Code extension into a pure thin client. All rule verification and AST operations are strictly managed by the QA Brain Core.
- **Core-Driven Detection**: Integrated dynamic loading of Core modules (`Scanner`, `ContextBuilder`, `RepositoryLoader`) within the extension. `Scanner` is now the single source of truth for file eligibility.
- **Manual Settings Overrides**: Added `qaBrain.frameworkOverride` workspace configuration option (`Auto`, `Playwright`, `Selenium`, `Disabled`).
- **Graceful Error Management**: Intercepted unsupported file saves (e.g. `.py` files) to show warning notifications without throwing runtime exceptions.
- **UI Enhancements**:
  - Registered Python language CodeLens provider.
  - Formatted status bar status to display the active framework dynamically: `🧠 QA Brain | Playwright | 85`.
- **Files Modified**:
  - `extensions/vscode/package.json` [MODIFY]
  - `extensions/vscode/src/types.ts` [MODIFY]
  - `extensions/vscode/src/reviewRunner.ts` [MODIFY]
  - `extensions/vscode/src/extension.ts` [MODIFY]

### 4. Completed Sprint 16: VS Code Diagnostics & Squiggles
- **Diagnostics Lifecycle Management**: Configured auto-cleanup to delete diagnostics when documents are closed, and updated runs to completely replace old values on save (preventing duplicate diagnostics).
- **CodeActions & Quick Fixes**: Created `extensions/vscode/src/codeActions.ts` and registered `QaBrainCodeActionProvider` to offer inline quick actions (`Show Finding Details` using modal popup, `Open Report`).
- **Visual Attention Mode**: Implemented status bar background/emoji coloring modes based on quality score threshold parameters (`qaBrain.statusBarAttentionMode`).
- **CodeLens Customization**: Shortened CodeLens summary labels to `🧠 Quality X • Risk Y` and dynamically rendered the `📖 Open Report` CodeLens conditionally depending on report presence.
- **Files Modified**:
  - `extensions/vscode/package.json` [MODIFY]
  - `extensions/vscode/src/vscode.d.ts` [MODIFY]
  - `extensions/vscode/src/codeLens.ts` [MODIFY]
  - `extensions/vscode/src/diagnostics.ts` [MODIFY]
  - `extensions/vscode/src/extension.ts` [MODIFY]
  - `extensions/vscode/src/codeActions.ts` [NEW]

### 5. Completed Sprint 17: Framework-Neutral VS Code Workspace UI (Phase 1)
- **MVVM Architecture**: Implemented `DashboardViewModel` (`dashboardViewModel.ts` [NEW]) to decouple the Webview UI from execution logic. Quality, Risk, and Maintainability scores and deltas are processed in the ViewModel and cached via `workspaceState`.
- **Sidebar Provider**: Created `QaBrainSidebarViewProvider` (`sidebarView.ts` [NEW]) implementing `vscode.WebviewViewProvider` to render native VS Code themed tabs (Review, Metrics).
- **Navigation & Reveal Action**: Implemented `jumpToLine` command to navigate selection and `revealRule` to open rule files in a side panel with anchor support (e.g. `locator-review.md#xpath`).
- **VS Code Typings**: Updated `vscode.d.ts` to include complete interfaces for Webview, WebviewView, WebviewViewProvider, Memento, ExtensionContext, and TextEditorEdit.
- **Files Modified**:
  - `extensions/vscode/package.json` [MODIFY]
  - `extensions/vscode/src/vscode.d.ts` [MODIFY]
  - `extensions/vscode/src/extension.ts` [MODIFY]
  - `extensions/vscode/src/dashboardViewModel.ts` [NEW]
  - `extensions/vscode/src/sidebarView.ts` [NEW]

### 6. Completed Sprint 18: Advanced Workspace Workbench (Phase 2)
- **Design Workbench Integration**: Connected `DashboardViewModel` to invoke the real `TestDesignEngine` on the active file. Renders missing test design scenarios (Boundary Value, ECP, Security, etc.) inside the Webview Design Tab.
- **Experimental Code Insertion**: Enabled template action handlers: copy to clipboard (`vscode.env.clipboard.writeText`) and editor insertion (`editor.edit` to write template directly at active cursor location). Labeled editor insertion as `[Insert (Experimental)]`.
- **Test Design Coverage breakdown**: Displays covered/missing categories by technique (ISTQB ECP, BVA, Security, Data Variation, Error Path) in the Coverage Tab.
- **LRU Workspace Cache Policy**: Implemented self-cleaning state caching in `workspaceState` with a 50-file limit. Calculates top 3 risky modules and top 3 violated rules across the workspace with trend recommendations.
- **Files Modified**:
  - `extensions/vscode/src/vscode.d.ts` [MODIFY]
  - `extensions/vscode/src/dashboardViewModel.ts` [MODIFY]
  - `extensions/vscode/src/sidebarView.ts` [MODIFY]
  - `extensions/vscode/src/extension.ts` [MODIFY]

### 7. Next Roadmap Strategy (Sprint 19 - 21+)
The next focus is extension release packaging and marketplace hardening:
- **Sprint 19**: VS Code Marketplace Release & Hardening (Opt-in Telemetry, Rule Packs packaging)
- **Sprint 20**: Python Core & Scanner
- **Sprint 21**: Python Adapter & Calibration
- **Future (v5.0 - v6.0)**: Quality Intelligence Platform & Enterprise Platform (SARIF, Quality Gates, CI thresholds)

---

*AI Assistant Handoff Directive: When starting a new session, read this file to synchronize your context with the latest project changes. When finishing a session, append a new dated entry detailing your changes, files modified, and next steps.*

---

## 2026-07-05 - Codex

### Completed Sprint 19: VS Code Marketplace Release & Hardening
- **Packaging**:
  - Added VS Code extension packaging metadata and scripts in `extensions/vscode/package.json`.
  - Added `extensions/vscode/scripts/prepare-package.js` to copy compiled QA Brain core and `knowledge/` assets into `extensions/vscode/qa-brain-core/` before packaging.
  - Added `extensions/vscode/.vscodeignore` to exclude TypeScript source, tests, benchmarks, validation data, screenshots, source maps, and generated files.
  - Added `extensions/vscode/LICENSE` so `vsce package` passes marketplace license checks.
- **Packaged Runtime Pathing**:
  - Added `extensions/vscode/src/extensionPaths.ts`.
  - Updated `reviewRunner`, `sidebarView`, and `dashboardViewModel` to prefer packaged `qa-brain-core/` assets and fall back to the repository root in Extension Development Host.
- **Telemetry & Privacy**:
  - Added `extensions/vscode/src/telemetry.ts` with strict opt-in local JSONL logging.
  - Telemetry default remains disabled via `qaBrain.telemetryEnabled: false`.
  - Logged anonymized `review`, `testDesign`, `crash`, and `featureUsage` events without file paths, repository URLs, code, API keys, or secrets.
  - Documented telemetry privacy behavior in `README.md`.
- **Rule Packs & Release Docs**:
  - Added `knowledge/rule-pack.json`.
  - Added `docs/versioning-policy.md`, `docs/release-checklist.md`, and `docs/release-artifacts.md`.
  - Added `CHANGELOG.md`.
  - Updated `ROADMAP.md` Sprint 19 status.
- **Verification**:
  - `npm run build` passed.
  - `npm run compile` in `extensions/vscode` passed.
  - `npm test` passed.
  - `npx @vscode/vsce package` succeeded.
  - Generated VSIX checksum: `D7E61493369C4D09EF245D9FC1C56801EE50821044D7E3CD9B39450C7D440434`.

### Remaining Manual Release Steps
- Install `extensions/vscode/qa-brain-vscode-client-0.1.0.vsix` in a clean VS Code profile.
- Verify sidebar, review, test design, diagnostics, CodeLens, and telemetry opt-in behavior manually.
- Publish the RC to VS Code Marketplace after publisher token setup.

---

## 2026-07-06 - Codex

### VS Code Client RC Hardening Continuation
- **Activity Bar / Marketplace Assets**:
  - Added and iterated on `extensions/vscode/assets/icon.png` for marketplace/listing usage.
  - Added `extensions/vscode/assets/activity-icon.svg` for the Activity Bar contribution.
  - Updated `extensions/vscode/package.json` to reference `assets/icon.png` and `assets/activity-icon.svg`.
  - Updated `.vscodeignore` so VSIX includes only the required icon assets and excludes extra source images under `assets/`.
- **Packaged Runtime Fix**:
  - Fixed installed-extension failure: `Cannot find module 'dotenv'`.
  - Root cause: `GeminiProvider` loaded `dotenv` with a hard import before deterministic rule-only fallback could run.
  - Updated `src/reviewer/GeminiProvider.ts` to load `dotenv` optionally inside `try/catch`; packaged VS Code extension no longer requires root `node_modules/dotenv`.
- **Dashboard & Review UX**:
  - Added editor context menu commands in `extensions/vscode/package.json`:
    - `QA Brain: Review Selection`
    - `QA Brain: Review Current Test File`
    - `QA Brain: Run Test Design Analysis`
    - `QA Brain: Clear Diagnostics`
  - Added `qaBrain.runTestDesign` to activation events and contributed commands.
  - Added `ReviewRun.reviewScope` in `extensions/vscode/src/types.ts`.
  - Updated `extensions/vscode/src/reviewRunner.ts` so full-file reviews report `reviewScope: 'file'` and selection reviews report `reviewScope: 'selection'`.
  - Updated `extensions/vscode/src/dashboardViewModel.ts` with active file name, active file path, review scope, and `contextLimited` state.
  - Updated `extensions/vscode/src/sidebarView.ts`:
    - Dashboard now shows active file name and `Full File` / `Selection` badge.
    - Added Dashboard action row: `Review File`, `Review Selection`, `Run Design`, `Open Report`, `Clear`.
    - Selection reviews show a context-limited warning for metrics/coverage.
    - Dashboard `Review File` and `Run Design` now pass the stored active file URI, so after a selection review the user can run full-file review again from the Dashboard.
- **Manual UX Findings Captured**:
  - Full file review on `examples/bad/hardcoded-wait.spec.ts` correctly detects `Redundant Hardcoded Timeout (waitForTimeout)`.
  - Selection review can be context-limited; future improvement should expand selected lines to the enclosing `test(...)` block where possible.
  - Test Design may report overly optimistic `100%` coverage for tiny/minimal examples; future improvement should support `insufficient domain context` / `not applicable` states.
- **Verification**:
  - `npm run build` passed.
  - `npm test` passed.
  - `npm run compile` from `extensions/vscode` passed.
  - `npm run package` from `extensions/vscode` passed.
  - Latest VSIX: `extensions/vscode/qa-brain-vscode-client-0.1.1.vsix`
  - `docs/release-artifacts.md` updated with the latest checksum.

## 2026-07-06 - Sprint 19.5 - Core Hardening & Stability

- **MCP Root Detection**:
  - Resolved `ReviewPipeline` and `TestDesignEngine` root mapping issues in `src/mcp.ts` using `findNearestProjectRoot` traversing helper.
- **LLM Normalizer**:
  - Created standalone `src/reviewer/LLMNormalizer.ts` for sanitizing and validating raw LLM response JSON shapes.
  - Delegated `review` and `designTests` parsing to `LLMNormalizer` in `src/reviewer/GeminiProvider.ts`.
- **Consolidated Assertion Helper**:
  - Created `src/utils/assertionHelper.ts` containing the shared `hasAssertionSignal` logic.
  - Deleted 4 duplicate metot declarations in `GeminiProvider.ts`, `KnowledgeRouter.ts`, `PlaywrightAdapter.ts`, and `SeleniumAdapter.ts`.
- **Deterministic Merge Contract**:
  - Updated `ReviewPipeline.ts` deduplication logic to preserve highest severity, highest confidence level, and sort findings by Line -> Title.
- **Unicode Regex Generalization**:
  - Replaced overfit 'türkçe'/'🧴' string matches with generic non-ASCII regex check `/[^\x00-\x7F]/` in `src/scorer/ScoringEngine.ts`.
- **Mimari Karar Günlüğü**:
  - Created `docs/architecture-decisions.md` containing 7 ADR entries.
- **Verification**:
  - Root `npm test` and `node dist/src/cli.js benchmark` (Passed: 12, Failed: 0, Precision: 100%) passed successfully.
  - VS Code client compiles and packages version `0.1.1` successfully.

### Next Steps for Release / Next Agent
- Push Sprint 19.5 changes to GitHub.
- Publish `qa-brain-vscode-client-0.1.1.vsix` to the VS Code Marketplace.
- Kick off Sprint 20 (Python Core & Scanner integration).

## 2026-07-06 - Sprint 20 - Python Core & Scanner (v4.0 Core)

- **Python Test File Detection**:
  - Extended `isTestFile()` in `src/core/Scanner.ts` to recognize Python file extensions (`.py`) and standard pytest/unittest patterns (`test_*.py`, `*_test.py`, `test.py`).
- **Python Dependency Parsing**:
  - Integrated `requirements.txt` parsing inside `ContextBuilder.ts`'s `mapDependencies()`. Successfully extracts python dependencies (e.g. `pytest`, `selenium`, `playwright`) and maps them to standard fields.
- **Python POM and Fixture Mapping**:
  - Extended `mapPageObjects()` and `mapFixtures()` in `ContextBuilder.ts` to scan `.py` files. Matches python class declarations and async/sync method definitions, and resolves pytest fixture files (e.g. `conftest.py`).
- **Python Framework Detection**:
  - Refined `detectFramework()` in `ContextBuilder.ts` to detect Python Selenium and Playwright framework imports. Prioritized file-level imports over global project dependencies to support hybrid repositories.
- **Verification**:
  - Added new birim test suite `testPythonSupport()` inside `tests/action-integration/action.test.ts`. Verified correct file scan filtering, POM mapping, and dependency parsing.
  - Bumped version to `0.1.2` across root `package.json` and extension client `package.json`.
  - Packaged and compiled version `0.1.2` VSIX successfully.
  - All unit/integration tests and 12/12 calibration benchmarks passed successfully.

### Next Steps for Release / Next Agent
- Push Sprint 20 changes to GitHub.
- Publish `qa-brain-vscode-client-0.1.2.vsix` to the VS Code Marketplace.
- Update the marketplace changelog.
- Kick off Sprint 21 (Python Selenium Adapter & Calibration).

## 2026-07-06 - Sprint 20 Addendum - Discovery-Only Guardrails

- **Python Review Guardrails**:
  - Kept Python support discovery-only for Sprint 20.
  - Added `Scanner.isPythonTestFile()` and `Scanner.isReviewableTestFile()` so Python test files can be discovered without entering review/scoring pipelines.
  - Updated CLI, GitHub Action, MCP, repository scanner, and VS Code Test Design command to skip Python review/test-design execution with explicit user-facing messages.
- **Mixed Repository Dependency Mapping**:
  - Updated `ContextBuilder.mapDependencies()` so mixed repositories can merge `package.json` and `requirements.txt` dependencies instead of choosing only one source.
  - Python dependencies are mapped into the standard dependency model and mirrored into `devDependencies` for backward compatibility.
- **Regression Coverage**:
  - Extended `tests/action-integration/action.test.ts` to verify Python test detection, review exclusion, mixed Node + Python dependency mapping, and DiffDetector filtering.
  - Added Python detection seed fixtures under `benchmarks/python/detection/`.
- **Verification Completed**:
  - `npm run build` passed.
  - `npm test` passed.
  - `node dist/src/cli.js benchmark` passed with 12/12 benchmark cases.
  - `npm run compile` from `extensions/vscode` passed.
  - `npm run package` from `extensions/vscode` passed and generated `qa-brain-vscode-client-0.1.2.vsix`.
- **Working Tree Note**:
  - Generated validation/metrics report files contain timing-only drift from verification runs. Do not include those in the Sprint 20 commit unless intentionally refreshing generated reports.
