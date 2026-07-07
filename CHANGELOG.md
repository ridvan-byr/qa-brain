# Changelog

## 0.2.0

- Added **Python Selenium Adapter** support for pytest framework, including 4 deterministic rule engines (XPath locators, hardcoded waits, missing driver teardowns, and missing assertion statements).
- Implemented file extension-based framework filtering to prevent Node.js Playwright/Selenium adapters from claiming Python files.
- Integrated Python support into `cli.ts` review execution, enabling direct CLI audits for `.py` test files.
- Updated `GeminiProvider` test design prompts to dynamically output Python/pytest code templates for `.py` specs.
- Removed VS Code extension checks blocking `.py` files, enabling both "Review" and "Test Design" sidebar tab features for Python.
- Configured real open-source Python Selenium repository calibration in the validation suite, confirming zero-false-positive detection on real-world test suites.

## 0.1.0

- First official release of **QA Cortex** (formerly QA Brain).
- Completed the QA Cortex brand migration across product text, package metadata, command names, configuration keys, reports, docs, and release metadata.
- Updated VS Code extension display name, dashboard text, commands, notifications, status bar, diagnostics, and output channel to use QA Cortex.
- Migrated integration test suite to **Vitest**, reducing test execution times to < 20ms and adding `vitest.config.ts` isolation.
- Created automated **GitHub Actions CI workflow** (`.github/workflows/ci.yml`) using Node 22 and kilitli npm dependency caching.
- Hardened `ScoringEngine` scoring formulas by migrating from fragile free-text substring matches to structured `FindingCategory` and `ruleId` fields.
- Refined `Scanner.ts` file detection regex to eliminate false-positive scans on non-test source files (e.g., `test-case.ts`).
- Generalized path calibration filters in `KnowledgeRouter` and `GeminiProvider` to remove repository-specific exceptions.
- Added Python test file scanner to scan `test_*.py`, `*_test.py`, and `test.py` files.
- Added `requirements.txt` parsing support to map Python dependencies like `pytest`, `selenium`, and `playwright`.
- Merged `package.json` and `requirements.txt` dependency discovery for mixed Node.js + Python repositories.
- Added Python Page Object Model (POM) parsing matching Python classes and async/sync methods.
- Added Python pytest fixture parsing matching `conftest.py` setup files.
- Added Python Selenium and Playwright framework detection based on library imports.
- Standalone `LLMNormalizer` to validate and sanitize raw provider JSON outputs.
- Dynamic project root resolution via `findNearestProjectRoot` in MCP tools to support nested monorepos.
- Deterministic ordering (Line -> Title) and severity merging for deduplicated findings.
- Direct LLM configuration UI in the VS Code sidebar dashboard supporting Gemini, OpenAI, Anthropic, and OpenRouter.
