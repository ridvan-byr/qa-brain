// MOCK PACKAGE.JSON FOR QA CORTEX SELF-TESTING
// Hedef: brain/repository/dependency-analysis.md
//
// Expected QA Cortex Output:
// 1. Observations -> [✗] ESLint static code quality checker detected.
// 2. Observations -> [✗] Husky git commit hooks integration detected.
// 3. Score Validation -> Quality Score and Maintainability Score MUST remain 100/100 (No penalties).
// 4. Output -> Stated only as observations under "Observations" section.

export const mockPackageJson = {
  name: "mock-project",
  version: "1.0.0",
  dependencies: {
    "express": "^4.18.2"
  },
  devDependencies: {
    "@playwright/test": "^1.55.0",
    "typescript": "^5.0.0"
    // Eksik olanlar: eslint, prettier, husky, lint-staged
  }
};
