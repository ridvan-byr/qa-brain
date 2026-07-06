# Changelog

## 0.1.3

- Completed the QA Cortex brand migration across product text, package metadata, command names, configuration keys, reports, docs, and release metadata.
- Updated VS Code extension display name, dashboard text, commands, notifications, status bar, diagnostics, and output channel to use QA Cortex.
- Refreshed the VS Code extension icon asset for the QA Cortex brand.
- Renamed package, CLI, MCP, VS Code command, configuration, and generated package identifiers to QA Cortex naming.

## 0.1.2

- Published the QA Cortex VS Code client to the Visual Studio Marketplace.
- Added Python test file scanner to scan `test_*.py`, `*_test.py`, and `test.py` files.
- Added `requirements.txt` parsing support to map Python dependencies like `pytest`, `selenium`, and `playwright`.
- Merged `package.json` and `requirements.txt` dependency discovery for mixed Node.js + Python repositories.
- Added Python Page Object Model (POM) parsing matching Python classes and async/sync methods.
- Added Python pytest fixture parsing matching `conftest.py` setup files.
- Added Python Selenium and Playwright framework detection based on library imports.
- Added regression test suite covering Python scanner integration features.
- Kept Python support in discovery-only mode by preventing Python test files from entering review, scoring, test design, GitHub Action review, CLI review, and MCP review pipelines.

## 0.1.1

- Added direct LLM configuration UI in the VS Code sidebar dashboard supporting Gemini, OpenAI, Anthropic, and OpenRouter.
- Added custom API endpoint and model name override inputs with automatic status masking.
- Added a settings cog toggle button in the dashboard header.
- Added an English `README.md` to populate the VS Code Marketplace overview page.
- Added a standalone `LLMNormalizer` to validate and sanitize raw provider JSON outputs.
- Added a consolidated `hasAssertionSignal` helper under `src/utils/` to remove duplicate code across adapters and router.
- Added dynamic project root resolution via `findNearestProjectRoot` in MCP tools to support nested monorepos.
- Added deterministic ordering (Line -> Title) and severity merging for deduplicated findings.
- Generalised Turkish/Shampoo overfit checks into a generic non-ASCII/i18n check in `ScoringEngine`.
- Created `docs/architecture-decisions.md` containing 7 Architecture Decision Records (ADR).

## 0.1.0 RC

- Added VS Code marketplace packaging preparation.
- Added strictly opt-in local telemetry logging for review, test design, crash, and feature usage events.
- Added versioned rule pack manifest under `knowledge/rule-pack.json`.
- Added VSIX packaging asset preparation for compiled QA Cortex core and knowledge files.
- Added versioning policy documentation.
- Documented telemetry privacy behavior in `README.md`.
