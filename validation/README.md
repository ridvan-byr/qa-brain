# QA Cortex Validation Workspace

This folder supports Sprint 11 real repository validation.

## Setup

1. Copy `repositories.example.json` to `repositories.json`.
2. Clone or place each target Playwright repository locally.
3. Fill each repository `localPath`.
4. Run:

```bash
npm run validate -- validation/repositories.json
```

or after build:

```bash
qa-cortex validate validation/repositories.json
```

## Outputs

Reports are written to:

```text
validation/reports/latest-validation-report.md
validation/reports/latest-validation-report.json
```

## Manual Triage

The runner measures repository selection, rule usage, review time, and findings. Precision, recall, false positives, and false negatives still require manual triage. Every false positive and false negative should produce one of:

- a new benchmark,
- a rule improvement,
- a documented justification.
