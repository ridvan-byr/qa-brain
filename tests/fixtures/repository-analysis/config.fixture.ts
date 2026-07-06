// MOCK CONFIGURATION FOR QA CORTEX SELF-TESTING
// Hedef: brain/repository/configuration-analysis.md
//
// Expected QA Cortex Output:
// 1. Detected Configuration -> Workers: 1 (Fully Parallel: false)
// 2. Warning -> Parallel execution is disabled (workers: 1). Recommend fullyParallel: true.
// 3. Warning -> Tracing is set to 'off'. Recommend 'on-first-retry' or 'retain-on-failure'.
// 4. Warning -> Screenshots and Videos are disabled. Recommend enabling on failure.

export const mockPlaywrightConfig = {
  timeout: 60000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
};
