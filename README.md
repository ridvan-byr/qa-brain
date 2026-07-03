# QA Brain

> Repository-aware, rule-driven, deterministic AI code review engine for Playwright test automation.

**Status**: v0.1.0 — CLI Ready 🚀

---

## What is QA Brain?

QA Brain is an AI-powered review engine that analyzes your Playwright test suites and generates structured, evidence-based quality reports. It combines a curated knowledge base of best practices with deterministic scoring algorithms to deliver consistent, explainable code review results.

### Key Features

- **Repository-Aware Analysis**: Scans `package.json`, `playwright.config.ts`, Page Objects, and custom fixtures to build full project context before review.
- **Signal-Based Knowledge Routing**: Only loads relevant review rules for each file, reducing token usage and improving accuracy.
- **Deterministic Scoring**: Quality, Risk, and Maintainability scores are computed mathematically — not by LLM opinion.
- **Evidence-Based Findings**: Every finding includes the exact code snippet and a concrete recommendation.
- **Benchmark Suite**: Built-in calibration runner with Ground Truth JSON files to measure Precision and Recall.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/ridvan-byr/qa-brain.git
cd qa-brain

# Install dependencies
npm install

# Build the CLI
npm run build

# Link globally (optional, enables `qa-brain` command)
npm link
```

---

## CLI Usage

### Review a single file

```bash
qa-brain review tests/login.spec.ts
```

### Review an entire directory

```bash
qa-brain review tests/
```

### Review with verbose debug output

```bash
qa-brain review tests/ --verbose
```

### Run the benchmark calibration suite

```bash
qa-brain benchmark
```

### Save reports as JSON

```bash
qa-brain review tests/ --format json
```

### Custom output folder

```bash
qa-brain review tests/ --output reports/
```

### Select LLM provider

```bash
qa-brain review tests/ --provider gemini
```

### Show version

```bash
qa-brain --version
```

### Show help

```bash
qa-brain --help
```

---

## CLI Options Reference

| Option | Description | Default |
| :--- | :--- | :--- |
| `--help`, `-h` | Show usage guide | — |
| `--version`, `-v` | Show version number | — |
| `--verbose` | Print detailed debug info (rules loaded, tokens, scores) | `false` |
| `--format <type>` | Output format: `markdown` or `json` | `markdown` |
| `--output <dir>` | Directory to save reports | `reviews/` |
| `--provider <name>` | LLM provider: `gemini`, `openai`, `anthropic` | `gemini` |
| `--config <path>` | Path to `qa-brain.config.json` | — |

---

## Architecture

```
CLI (src/cli.ts)
  │
  ▼
QABrainCore / ReviewPipeline
  │
  ├── RepositoryLoader → ContextBuilder
  │
  ├── KnowledgeRouter (Signal-based rule selection)
  │
  ├── LLMProvider (GeminiProvider / Mock Fallback)
  │
  ├── ScoringEngine (Deterministic quality/risk/maintainability)
  │
  └── ReportGenerator (Markdown / JSON output)
```

---

## Benchmark Results

Run `qa-brain benchmark` to execute the calibration suite:

```
==========================================
Passed: 5
Failed: 0
Precision: 100.0%
Recall: 100.0%
Average Review Time: 2.6ms
==========================================

Category Summary:
- Locator Rules: 2/2 Passed
- Waiting Rules: 1/1 Passed
- POM Rules: 1/1 Passed
- Fixture Rules: 1/1 Passed
```

---

## Project Roadmap

See [ROADMAP.md](ROADMAP.md) for the full sprint history and future plans.

---

## License

ISC