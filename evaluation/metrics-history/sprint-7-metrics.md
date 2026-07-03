# Sprint 7 Calibration Run Metrics

Date: 2026-07-03T17:37:19.820Z

## Accuracy Calculations
- **Precision**: 100.0%
- **Recall**: 100.0%
- **False Positives**: 0
- **False Negatives**: 0
- **Average Review Time**: 2.6ms
- **Regression**: None

## Rule Engine Routing
- **Total Knowledge Rules Available**: 51
- **Rules Loaded in Session**: 36

## LLM Execution Mode
- **Provider**: Gemini 2.5 Flash (Mock Fallback)
- **Average Tokens Used**: ~4100 (Prompt: 3200, Completion: 900)

## Test Runs Detail
| ID | Test File Path | Status | Expected Score | Actual Score | Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| LOCATOR_002 | benchmarks\playwright\locator\brittle-css.spec.ts | PASS | 80 | 80 | 4ms |
| WAITING_001 | benchmarks\playwright\waiting\hardcoded-wait.spec.ts | PASS | 85 | 85 | 2ms |
| POM_001 | benchmarks\playwright\pom\pom-leak.spec.ts | PASS | 80 | 80 | 3ms |
| FIXTURE_001 | benchmarks\playwright\fixtures\shared-state.spec.ts | PASS | 80 | 80 | 2ms |
| LOCATOR_001 | benchmarks\playwright\locator\xpath.spec.ts | PASS | 60 | 60 | 2ms |