# Sprint 7 Calibration Run Metrics

Date: 2026-07-04T20:28:14.799Z

## Accuracy Calculations
- **Precision**: 100.0%
- **Recall**: 100.0%
- **False Positives**: 0
- **False Negatives**: 0
- **Average Review Time**: 3.0ms
- **Regression**: None

## Rule Engine Routing
- **Total Knowledge Rules Available**: 51
- **Rules Loaded in Session**: 42

## LLM Execution Mode
- **Provider**: Gemini 2.5 Flash (Deterministic Rule Fallback)
- **Average Tokens Used**: ~4100 (Prompt: 3200, Completion: 900)

## Test Runs Detail
| ID | Test File Path | Status | Expected Score | Actual Score | Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| LOCATOR_002 | benchmarks\playwright\locator\brittle-css.spec.ts | PASS | 80 | 80 | 6ms |
| ASSERTION_002 | benchmarks\playwright\assertions\db-query-without-assertion.spec.ts | PASS | 80 | 80 | 2ms |
| ASSERTION_001 | benchmarks\playwright\assertions\fixture-reset-without-assertion.spec.ts | PASS | 80 | 80 | 2ms |
| WAITING_001 | benchmarks\playwright\waiting\hardcoded-wait.spec.ts | PASS | 85 | 85 | 3ms |
| POM_001 | benchmarks\playwright\pom\pom-leak.spec.ts | PASS | 80 | 80 | 3ms |
| FIXTURE_001 | benchmarks\playwright\fixtures\shared-state.spec.ts | PASS | 80 | 80 | 3ms |
| LOCATOR_001 | benchmarks\playwright\locator\xpath.spec.ts | PASS | 60 | 60 | 2ms |