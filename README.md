# QA Cortex

> Repository-aware, rule-driven QA review engine for test automation projects.

**Status**: v0.1.0 - CLI, GitHub Action, MCP, and VS Code client available.

---

## What is QA Cortex?

QA Cortex analyzes test automation projects and generates structured quality reports. It combines repository context, curated QA knowledge, deterministic local rules, and optional Gemini review output.

When `GEMINI_API_KEY` is available, QA Cortex asks Gemini to review the selected test against routed rule files (LLM-Assisted mode: review time ~1-3 seconds). Without an API key, it runs a local deterministic rule review for common issues such as brittle selectors, hardcoded waits, shared state, and missing assertions (Rule Engine mode: review time < 5ms).

### Key Features

- **Repository-aware analysis**: Reads `package.json`, `playwright.config.ts`, Page Objects, and custom fixtures before review.
- **Signal-based knowledge routing**: Loads only the rule files relevant to the target spec.
- **Deterministic scoring**: Quality, risk, and maintainability scores are calculated from findings and context.
- **Evidence-based findings**: Findings include code evidence and concrete recommendations.
- **Benchmark suite**: Built-in calibration runner with ground-truth JSON files.
- **GitHub Action support**: Reviews changed PR test files, or a configured `review-path`.
- **MCP server support**: Exposes file, repository, and benchmark review tools over stdio.
- **VS Code client**: Published VS Code extension for Problems panel diagnostics, Output reports, Status Bar, CodeLens, and dashboard workflows.

### Framework Support

| Framework / Language | Support Level | Notes |
| :--- | :--- | :--- |
| Playwright TypeScript/JavaScript | Supported | Review, scoring, benchmark, validation, CLI, MCP, GitHub Action, and VS Code workflows. |
| Selenium WebDriver for Node.js | Preview/Foundation | Adapter and seed benchmarks exist; broader calibration continues. |
| Python test projects | Discovery-only | Scanner detects Python tests, dependencies, fixtures, and POM structures, but Python review/scoring is intentionally disabled for now. |

---

## Installation

### VS Code Marketplace

Install the VS Code client from Marketplace:

Marketplace listing will be published under the QA Cortex identity.

### Local CLI / Core

```bash
git clone https://github.com/ridvan-byr/qa-cortex.git
cd qa-cortex
npm install
npm run build
```

Optional global link:

```bash
npm link
```

---

## CLI Usage

Review a single file:

```bash
qa-cortex review tests/login.spec.ts
```

Review a directory:

```bash
qa-cortex review tests/
```

Run with verbose diagnostics:

```bash
qa-cortex review tests/ --verbose
```

Save JSON output:

```bash
qa-cortex review tests/ --format json
```

Run benchmark calibration:

```bash
qa-cortex benchmark
```

### CLI Options

| Option | Description | Default |
| :--- | :--- | :--- |
| `--help`, `-h` | Show usage guide | - |
| `--version`, `-v` | Show version number | - |
| `--verbose` | Print debug info such as routed rules and scores | `false` |
| `--format <type>` | Output format: `markdown` or `json` | `markdown` |
| `--output <dir>` | Directory to save reports | `reviews/` |
| `--provider <name>` | LLM provider. Currently only `gemini` is supported. | `gemini` |
| `--config <path>` | Path to `qa-cortex.config.json` | - |

---

## GitHub Action

```yaml
name: QA Cortex

on:
  pull_request:

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ridvan-byr/qa-cortex@v0.1.0
        with:
          github-token: ${{ github.token }}
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          max-files: '30'
```

If `review-path` is provided, the action scans that file or directory. Otherwise, it reviews changed `.spec.ts` and `.test.ts` files in the pull request.

---

## Architecture

```text
CLI / GitHub Action / MCP / VS Code Client
  |
  v
ReviewPipeline
  |
  +-- RepositoryLoader -> ContextBuilder
  +-- KnowledgeRouter
  +-- GeminiProvider or deterministic rule fallback
  +-- ScoringEngine
  +-- ReportGenerator / PRCommentFormatter
```

---

## Benchmark

```bash
npm run build
qa-cortex benchmark
```

The benchmark suite is useful for regression checks, but it is not a substitute for real repository validation. Real-world validation across open-source Playwright repositories is planned in Sprint 11.

---

## VS Code Client

QA Cortex is available as a VS Code extension:

Marketplace listing will be published under the QA Cortex identity.

The extension source lives under `extensions/vscode`.

Build the root project first so the extension can reuse the compiled QA Cortex core:

```bash
npm run build
npx tsc -p extensions/vscode
```

Available commands:

| Command | Description |
| :--- | :--- |
| `QA Cortex: Review Current Test File` | Reviews the active `.spec` / `.test` file. |
| `QA Cortex: Review Selection` | Reviews the selected test block. |
| `QA Cortex: Review Changed Files` | Reviews changed Playwright test files from git diff. |
| `QA Cortex: Open Latest Report` | Opens the latest Markdown report generated by the extension. |
| `QA Cortex: Clear Diagnostics` | Clears QA Cortex Problems panel diagnostics. |

Default configuration:

| Setting | Default |
| :--- | :--- |
| `qaCortex.reviewMode` | `rule-only` |
| `qaCortex.reviewOnSave` | `false` |
| `qaCortex.openReportAfterReview` | `false` |
| `qaCortex.showDiagnostics` | `true` |
| `qaCortex.showCodeLens` | `true` |
| `qaCortex.showStatusBar` | `true` |
| `qaCortex.telemetryEnabled` | `false` |

The VS Code client is designed to run in VS Code Extension Development Host on Windows, macOS, and Linux by relying on VS Code and Node path APIs rather than platform-specific shell behavior.

### Privacy & Telemetry

QA Cortex telemetry is strictly opt-in and disabled by default. When enabled, the VS Code client writes anonymized local telemetry events to extension storage for review, test design, crash, and feature usage events.

Telemetry never records file paths, repository URLs, source code, API keys, or secrets. Every event includes a schema version and the extension version for compatibility tracking.

---

## Validation Dataset

Sprint 21 validation was completed against 10 open-source Playwright repositories.

Latest local validation run:

| Metric | Value |
| :--- | :--- |
| Repositories configured | 10 |
| Files reviewed | 231 |
| Findings generated | 2 |
| Average review time (Rule Engine) | 2ms |
| Average review time (LLM Mode) | ~1 - 3 seconds |
| LLM provider comparison | Deferred |

Manual triage of the findings is logged in `validation/reports/latest-validation-report.md`. The local deterministic engine reviewed 231 files in 2ms per file and correctly identified 2 high-confidence true positives.

The latest generated report is available at `validation/reports/latest-validation-report.md`.

---

## License

MIT
