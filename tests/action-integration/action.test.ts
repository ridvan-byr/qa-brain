import * as assert from 'assert';
import { DiffDetector, type ChangedFile } from '../../src/github/DiffDetector';
import { PRCommentFormatter, type PRReviewSummary } from '../../src/reporter/PRCommentFormatter';
import { ReviewPipeline } from '../../src/core/ReviewPipeline';
import { GeminiProvider } from '../../src/reviewer/GeminiProvider';
import { AdapterRegistry } from '../../src/framework/AdapterRegistry';
import { KnowledgeRouter } from '../../src/router/KnowledgeRouter';
import { PLAYWRIGHT_ROUTING_RULES, SELENIUM_ROUTING_RULES } from '../../src/router/RuleMapping';
import { TestDesignEngine } from '../../src/design/TestDesignEngine';

function testDiffDetector() {
  console.log('Testing DiffDetector...');

  // Mock token is fine for instantiation and pattern testing
  const detector = new DiffDetector('mock-token');

  const files: ChangedFile[] = [
    { filename: 'src/cli.ts', status: 'modified' },
    { filename: 'tests/login.spec.ts', status: 'modified' },
    { filename: 'tests/logout.test.ts', status: 'added' },
    { filename: 'tests/test_login.py', status: 'modified' },
    { filename: 'tests/old.spec.ts', status: 'removed' },
    { filename: 'generated/test.spec.ts', status: 'added' },
    { filename: 'fixtures/fixture.ts', status: 'modified' },
  ];

  // 1. Basic filtering (only spec.ts/test.ts and ignore removed)
  const filtered1 = detector.filterTestFiles(files);
  assert.deepStrictEqual(filtered1, [
    'tests/login.spec.ts',
    'tests/logout.test.ts',
    'generated/test.spec.ts'
  ]);

  // 2. Ignore patterns
  const filtered2 = detector.filterTestFiles(files, ['**/generated/**', '**/fixtures/**']);
  assert.deepStrictEqual(filtered2, [
    'tests/login.spec.ts',
    'tests/logout.test.ts'
  ]);

  console.log('✓ DiffDetector tests passed.');
}

function testPRCommentFormatter() {
  console.log('Testing PRCommentFormatter...');

  const summary: PRReviewSummary = {
    filesReviewed: 2,
    criticalFindings: 1,
    executionMode: '🤖 Gemini 2.5 Flash + Rules',
    results: [
      {
        file: 'tests/login.spec.ts',
        qualityScore: 90,
        verdict: 'Good',
        findingsCount: 1,
        criticalCount: 0,
        findings: []
      },
      {
        file: 'tests/checkout.spec.ts',
        qualityScore: 40,
        verdict: 'Poor',
        findingsCount: 2,
        criticalCount: 1,
        findings: [
          {
            title: 'Hardcoded timeout',
            description: 'waitForTimeout should not be used',
            severity: 'Critical',
            confidence: { level: 100, justification: [] },
            evidence: 'await page.waitForTimeout(5000);',
            recommendation: 'Use auto-waiting assertions.'
          }
        ]
      }
    ]
  };

  const comment = PRCommentFormatter.formatComment(summary);

  assert.ok(comment.includes('<!-- qa-brain-review -->'));
  assert.ok(comment.includes('## 🧠 QA Brain Review'));
  assert.ok(comment.includes('🤖 Gemini 2.5 Flash + Rules'));
  assert.ok(comment.includes('| `tests/checkout.spec.ts` | 40/100 | ❌ Poor | 1 Critical, 1 Other |'));
  assert.ok(comment.includes('Hardcoded timeout'));
  assert.ok(comment.includes('await page.waitForTimeout(5000);'));

  const stepSummary = PRCommentFormatter.formatStepSummary(summary);
  assert.ok(stepSummary.includes('Average Score | 65/100'));

  console.log('✓ PRCommentFormatter tests passed.');
}

function testScanner() {
  console.log('Testing Scanner...');
  const { Scanner } = require('../../src/core/Scanner');

  // We can scan the benchmarks folder as a test
  const allFiles = Scanner.scanDirectory('benchmarks/playwright');
  assert.ok(allFiles.length > 0);

  // Check deterministic sorting
  const sortedFiles = [...allFiles].sort();
  assert.deepStrictEqual(allFiles, sortedFiles);

  // Check ignore patterns
  const filteredFiles = Scanner.scanDirectory('benchmarks/playwright', ['**/locator/**']);
  // locator folder files should be excluded
  const hasLocator = filteredFiles.some((f: string) => f.includes('locator'));
  assert.strictEqual(hasLocator, false);

  console.log('✓ Scanner tests passed.');
}

function testPythonSupport() {
  console.log('Testing Python support...');
  const { Scanner } = require('../../src/core/Scanner');
  const { ContextBuilder } = require('../../src/loader/ContextBuilder');

  // 1. Test Scanner file matching
  assert.strictEqual(Scanner.isTestFile('test_login.py'), true);
  assert.strictEqual(Scanner.isTestFile('login_test.py'), true);
  assert.strictEqual(Scanner.isTestFile('test.py'), true);
  assert.strictEqual(Scanner.isTestFile('login.spec.py'), true);
  assert.strictEqual(Scanner.isReviewableTestFile('test_login.py'), false);
  assert.strictEqual(Scanner.isReviewableTestFile('login.spec.ts'), true);
  assert.strictEqual(Scanner.isTestFile('login.py'), false);
  assert.strictEqual(Scanner.isTestFile('utils.py'), false);

  // Mock loader for ContextBuilder tests
  const mockLoader = {
    readRawFile(filePath: string): string | null {
      if (filePath === 'requirements.txt') {
        return `
# Dependencies
pytest==7.1.2
selenium>=4.0.0
playwright
`;
      }
      if (filePath === 'package.json') {
        return null;
      }
      if (filePath === 'pages/login_page.py') {
        return `
class LoginPage(BasePage, ABC):
    def __init__(self, driver):
        self.driver = driver
    def enter_username(self, username):
        pass
    async def submit_form(self):
        pass
`;
      }
      if (filePath === 'tests/conftest.py') {
        return `
@pytest.fixture
def auth_token():
    return "token123"

@pytest.fixture(scope="session")
def api_client():
    pass
`;
      }
      return null;
    },
    directoryExists(dirPath: string): boolean {
      return dirPath === 'pages' || dirPath === 'tests';
    },
    scanDirectory(dirPath: string, match: string | string[]): string[] {
      if (dirPath === 'pages') return ['pages/login_page.py'];
      return [];
    }
  };

  const builder = new ContextBuilder(mockLoader as any);

  // 2. Test requirements.txt dependency mapping
  const context = builder.buildContext('test_login.py', 'from selenium import webdriver');
  assert.strictEqual(context.dependencies.playwrightVersion, 'latest');
  assert.strictEqual(context.dependencies.seleniumVersion, '4.0.0');
  assert.strictEqual(context.dependencies.dependencies['pytest'], '7.1.2');

  // 3. Test Python framework and runner detection
  assert.strictEqual(context.targetFile.detectedFramework, 'Selenium');
  assert.strictEqual(context.targetFile.detectedTestRunner, 'pytest');
  
  const playwrightContext = builder.buildContext('test_playwright.py', 'from playwright.sync_api import sync_playwright');
  assert.strictEqual(playwrightContext.targetFile.detectedFramework, 'Playwright');
  assert.strictEqual(playwrightContext.targetFile.detectedTestRunner, 'pytest');

  const unittestContext = builder.buildContext('test_unit.py', 'import unittest\nclass MyTest(unittest.TestCase): pass');
  assert.strictEqual(unittestContext.targetFile.detectedTestRunner, 'unittest');

  // 4. Test Python POM mapping with inheritance (LoginPage(BasePage, ABC))
  assert.strictEqual(context.pageObjects.length, 1);
  assert.strictEqual(context.pageObjects[0].className, 'LoginPage');
  assert.deepStrictEqual(context.pageObjects[0].methods, ['enter_username', 'submit_form']);

  // 5. Test pytest decorated fixtures parsing from conftest.py
  assert.strictEqual(context.fixtures.length, 2);
  assert.strictEqual(context.fixtures[0].name, 'auth_token');
  assert.strictEqual(context.fixtures[1].name, 'api_client');

  // 6. Test Mixed Repository (package.json + requirements.txt) dependency mapping
  const mixedLoader = {
    readRawFile(filePath: string): string | null {
      if (filePath === 'package.json') {
        return JSON.stringify({
          devDependencies: { '@playwright/test': '^1.40.0' }
        });
      }
      if (filePath === 'requirements.txt') {
        return 'selenium>=4.0.0';
      }
      return null;
    },
    directoryExists(dirPath: string): boolean { return false; },
    scanDirectory(dirPath: string, match: string | string[]): string[] { return []; }
  };
  const mixedBuilder = new ContextBuilder(mixedLoader as any);
  const mixedContext = mixedBuilder.buildContext('test_mixed.py', 'from selenium import webdriver');
  // Should merge package.json and requirements.txt without losing either ecosystem.
  assert.strictEqual(mixedContext.dependencies.playwrightVersion, '^1.40.0');
  assert.strictEqual(mixedContext.dependencies.seleniumVersion, '4.0.0');
  assert.strictEqual(mixedContext.dependencies.devDependencies['@playwright/test'], '^1.40.0');
  assert.strictEqual(mixedContext.dependencies.dependencies['selenium'], '4.0.0');
  assert.strictEqual(mixedContext.dependencies.devDependencies['selenium'], '4.0.0');

  console.log('✓ Python support tests passed.');
}

function testFrameworkAdapterRegistry() {
  console.log('Testing FrameworkAdapter registry...');

  const registry = new AdapterRegistry();
  const result = registry.resolve({
    dependencies: {
      playwrightVersion: '^1.61.1',
      devDependencies: { '@playwright/test': '^1.61.1' },
      dependencies: {},
      hasESLint: false,
      hasPrettier: false,
      hasHusky: false,
      hasLintStaged: false,
    },
    targetFile: {
      filePath: 'tests/login.spec.ts',
      detectedFramework: 'Playwright',
      detectedFeature: 'Authentication',
      content: [
        "import { test } from '@playwright/test';",
        'let sharedState = false;',
        "test('login', async ({ page }) => {",
        "  await page.locator('//button[@type=\"submit\"]').click();",
        '  await page.waitForTimeout(1000);',
        '});',
      ].join('\n'),
    },
  });

  assert.strictEqual(result.adapterName, 'playwright');
  assert.strictEqual(result.context.framework, 'playwright');
  assert.ok(result.signals.some(signal => signal.type === 'locator'));
  assert.ok(result.signals.some(signal => signal.type === 'wait'));
  assert.ok(result.signals.some(signal => signal.type === 'lifecycle'));
  assert.ok(result.signals.some(signal => signal.type === 'assertion'));
  assert.ok(result.knowledgeProfile.ruleFiles.includes('knowledge/playwright/review-rules/locator-review.md'));

  const seleniumResult = registry.resolve({
    dependencies: {
      playwrightVersion: undefined,
      devDependencies: {},
      dependencies: { 'selenium-webdriver': '^4.27.0' },
      hasESLint: false,
      hasPrettier: false,
      hasHusky: false,
      hasLintStaged: false,
    },
    targetFile: {
      filePath: 'tests/login.selenium.spec.ts',
      detectedFramework: 'Selenium',
      detectedFeature: 'Authentication',
      content: [
        "import { Builder, By } from 'selenium-webdriver';",
        "it('login', async () => {",
        "  const driver = await new Builder().forBrowser('chrome').build();",
        "  await driver.findElement(By.xpath('//button')).click();",
        '});',
      ].join('\n'),
    },
  });

  assert.strictEqual(seleniumResult.adapterName, 'selenium');
  assert.ok(seleniumResult.signals.some(signal => signal.type === 'locator'));
  assert.ok(seleniumResult.signals.some(signal => signal.type === 'lifecycle'));
  assert.ok(seleniumResult.signals.some(signal => signal.type === 'assertion'));
  assert.ok(seleniumResult.knowledgeProfile.ruleFiles.includes('knowledge/selenium/review-rules/locator-review.md'));

  console.log('✓ FrameworkAdapter registry tests passed.');
}

function testKnowledgeRouterSignalRouting() {
  console.log('Testing KnowledgeRouter signal routing...');

  const router = new KnowledgeRouter();
  const baseContext = {
    repositoryInfo: { path: '.', structure: {} },
    dependencies: {
      devDependencies: {},
      dependencies: {},
      hasESLint: false,
      hasPrettier: false,
      hasHusky: false,
      hasLintStaged: false,
    },
    configuration: {},
    pageObjects: [],
    fixtures: [],
    targetFile: {
      filePath: 'tests/login.spec.ts',
      detectedFramework: 'Playwright',
      detectedFeature: 'General UI',
      content: "test('login', async ({ page }) => { await page.click('button'); });",
    },
  };

  const signalRoutedFiles = router.routeKnowledge({
    ...baseContext,
    framework: {
      adapterName: 'playwright',
      context: {
        framework: 'playwright',
        targetFile: baseContext.targetFile,
      },
      signals: [
        {
          type: 'locator',
          framework: 'playwright',
          ruleHints: ['locator'],
          evidence: "await page.click('button');",
          location: { file: 'tests/login.spec.ts' },
        },
      ],
      knowledgeProfile: {
        baseKnowledgeFiles: [],
        ruleFiles: [],
        genericKnowledgeFiles: [],
      },
    },
  });

  assert.ok(signalRoutedFiles.includes('knowledge/playwright/review-rules/locator-review.md'));

  const fallbackRoutedFiles = router.routeKnowledge({
    ...baseContext,
    targetFile: {
      ...baseContext.targetFile,
      content: "test('login', async ({ page }) => { await page.locator('//button').click(); });",
    },
  });

  assert.ok(fallbackRoutedFiles.includes('knowledge/playwright/review-rules/locator-review.md'));

  console.log('✓ KnowledgeRouter signal routing tests passed.');
}

function testRuleMappingContract() {
  console.log('Testing rule mapping contract...');

  const missingAssertion = PLAYWRIGHT_ROUTING_RULES.find(mapping => mapping.rule === 'Missing Assertion');
  const brittleLocator = PLAYWRIGHT_ROUTING_RULES.find(mapping => mapping.rule === 'Brittle Locator');
  const seleniumCleanup = SELENIUM_ROUTING_RULES.find(mapping => mapping.rule === 'Resource Cleanup');

  assert.ok(missingAssertion);
  assert.strictEqual(missingAssertion.generic, true);
  assert.deepStrictEqual(missingAssertion.adapterEvidence, ['AssertionSignal']);

  assert.ok(brittleLocator);
  assert.strictEqual(brittleLocator.generic, false);
  assert.deepStrictEqual(brittleLocator.adapterEvidence, ['Playwright LocatorSignal']);

  assert.ok(seleniumCleanup);
  assert.strictEqual(seleniumCleanup.generic, true);
  assert.deepStrictEqual(seleniumCleanup.adapterEvidence, ['LifecycleSignal']);

  console.log('✓ Rule mapping contract tests passed.');
}

async function testDeterministicRuleFallback() {
  console.log('Testing deterministic rule fallback...');

  const pipeline = new ReviewPipeline('.', new GeminiProvider(''));
  const { result } = await pipeline.runPipeline('examples/bad/missing-assertion.spec.ts');

  assert.notStrictEqual(result.finalVerdict, 'Excellent');
  assert.ok(result.findings.some(f => f.title === 'Missing Assertion'));

  console.log('✓ Deterministic rule fallback tests passed.');
}

async function testTestDesignEngine() {
  console.log('Testing TestDesignEngine...');

  const engine = new TestDesignEngine('.', new GeminiProvider(''));
  
  // 1. Test missing-assertion form input limits
  const result1 = await engine.designTests('examples/bad/missing-assertion.spec.ts');
  assert.strictEqual(result1.fileName, 'examples/bad/missing-assertion.spec.ts');
  assert.strictEqual(result1.framework, 'playwright');
  assert.ok(result1.coverageScore < 100);
  assert.ok(result1.missingScenarios.some(s => s.title === 'Input Length Extreme Boundary Validation'));

  // 2. Test login-form BVA and Unicode credentials
  const result2 = await engine.designTests('benchmarks/design/login-form.spec.ts');
  assert.strictEqual(result2.fileName, 'benchmarks/design/login-form.spec.ts');
  assert.ok(result2.missingScenarios.some(s => s.title === 'Empty Password Field Validation'));
  assert.ok(result2.missingScenarios.some(s => s.title === 'Unicode & Accent Character Credentials'));

  // 3. Test feedback-form extreme length limits
  const result3 = await engine.designTests('benchmarks/design/feedback-form.spec.ts');
  assert.strictEqual(result3.fileName, 'benchmarks/design/feedback-form.spec.ts');
  assert.ok(result3.missingScenarios.some(s => s.title === 'Input Length Extreme Boundary Validation'));

  console.log('✓ TestDesignEngine tests passed.');
}

async function runAll() {
  try {
    testDiffDetector();
    testPRCommentFormatter();
    testScanner();
    testPythonSupport();
    testFrameworkAdapterRegistry();
    testKnowledgeRouterSignalRouting();
    testRuleMappingContract();
    await testDeterministicRuleFallback();
    await testTestDesignEngine();
    console.log('\nAll integration tests passed successfully!');
  } catch (error) {
    console.error('Test verification failed:', error);
    process.exit(1);
  }
}

runAll();
