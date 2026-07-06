# Changelog

## 0.1.0

- First official release of **QA Cortex** (formerly QA Brain).
- Completed the QA Cortex brand migration across product text, package metadata, command names, configuration keys, reports, docs, and release metadata.
- Updated VS Code extension display name, dashboard text, commands, notifications, status bar, diagnostics, and output channel to use QA Cortex.
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
