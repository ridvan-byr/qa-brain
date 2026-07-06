import { RepositoryLoader } from './RepositoryLoader';
import { AdapterRegistry } from '../framework/AdapterRegistry';
import * as path from 'path';
import type { 
  ReviewContext, 
  RepositoryInfo, 
  DependencyInfo, 
  ConfigurationInfo, 
  PageObjectInfo, 
  FixtureInfo, 
  TargetFileInfo 
} from '../types/ReviewContext';

export class ContextBuilder {
  private readonly adapterRegistry = new AdapterRegistry();

  constructor(private loader: RepositoryLoader) {}

  /**
   * Builds a neutral ReviewContext object by scanning the repository.
   */
  public buildContext(targetFilePath: string, targetFileContent: string): ReviewContext {
    const repositoryInfo = this.mapRepositoryInfo();
    const dependencies = this.mapDependencies();
    const configuration = this.mapConfiguration();
    const pageObjects = this.mapPageObjects(repositoryInfo.structure.pagesDir);
    const fixtures = this.mapFixtures(repositoryInfo.structure.fixturesDir);

    const detectedFramework = this.detectFramework(dependencies, targetFileContent);
    const detectedFeature = this.detectFeature(targetFilePath, targetFileContent);
    const detectedTestRunner = this.detectTestRunner(targetFilePath, dependencies, targetFileContent);

    const targetFile: TargetFileInfo = {
      filePath: targetFilePath,
      content: targetFileContent,
      detectedFramework,
      detectedFeature,
      detectedTestRunner,
    };
    const framework = this.adapterRegistry.resolve({
      dependencies,
      targetFile,
    });

    return {
      repositoryInfo,
      dependencies,
      configuration,
      pageObjects,
      fixtures,
      targetFile,
      framework,
    };
  }

  private mapRepositoryInfo(): RepositoryInfo {
    const dirs = ['tests', 'e2e', 'spec', 'specs', 'pages', 'page-objects', 'fixtures', 'utils', 'helpers', 'data', 'mocks'];
    const structure: RepositoryInfo['structure'] = {};

    // Standard structural mappings
    if (this.loader.directoryExists('tests')) structure.testsDir = 'tests';
    else if (this.loader.directoryExists('e2e')) structure.testsDir = 'e2e';
    else if (this.loader.directoryExists('examples')) structure.testsDir = 'examples';

    if (this.loader.directoryExists('pages')) structure.pagesDir = 'pages';
    else if (this.loader.directoryExists('page-objects')) structure.pagesDir = 'page-objects';
    else if (this.loader.directoryExists('examples/good')) structure.pagesDir = 'examples/good'; // Fallback for examples setup

    if (this.loader.directoryExists('fixtures')) structure.fixturesDir = 'fixtures';
    if (this.loader.directoryExists('utils')) structure.utilsDir = 'utils';
    if (this.loader.directoryExists('data')) structure.dataDir = 'data';

    return {
      path: '.',
      structure,
    };
  }

  private mapDependencies(): DependencyInfo {
    const rawPackage = this.loader.readRawFile('package.json');
    const defaultInfo: DependencyInfo = {
      devDependencies: {},
      dependencies: {},
      hasESLint: false,
      hasPrettier: false,
      hasHusky: false,
      hasLintStaged: false,
    };

    let info: DependencyInfo = defaultInfo;

    if (rawPackage) {
      try {
        const parsed = JSON.parse(rawPackage);
        const devDeps = parsed.devDependencies || {};
        const deps = parsed.dependencies || {};

        const playwrightVersion = devDeps['@playwright/test'] || deps['@playwright/test'];
        const seleniumVersion = devDeps['selenium-webdriver'] || deps['selenium-webdriver'];

        info = {
          playwrightVersion,
          seleniumVersion,
          devDependencies: devDeps,
          dependencies: deps,
          hasESLint: !!(devDeps['eslint'] || deps['eslint']),
          hasPrettier: !!(devDeps['prettier'] || deps['prettier']),
          hasHusky: !!(devDeps['husky'] || deps['husky']),
          hasLintStaged: !!(devDeps['lint-staged'] || deps['lint-staged']),
        };
      } catch {
        // Fall through to requirements.txt
      }
    }

    // Parse Python dependencies from requirements.txt if present
    const rawRequirements = this.loader.readRawFile('requirements.txt');
    if (rawRequirements) {
      const pythonDeps = this.parseRequirements(rawRequirements);
      const dependencies = {
        ...info.dependencies,
        ...pythonDeps,
      };
      const devDependencies = {
        ...info.devDependencies,
        ...pythonDeps,
      };

      info = {
        ...info,
        playwrightVersion: info.playwrightVersion || dependencies['playwright'],
        seleniumVersion: info.seleniumVersion || dependencies['selenium'],
        devDependencies,
        dependencies,
      };
    }

    return info;
  }

  private parseRequirements(rawRequirements: string): Record<string, string> {
    const deps: Record<string, string> = {};

    for (const line of rawRequirements.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;

      const withoutInlineComment = trimmed.split(/\s+#/)[0].trim();
      const match = withoutInlineComment.match(/^([a-zA-Z0-9_\-]+)(?:\[[^\]]+\])?(?:\s*[<=>~!]+\s*([0-9.*a-zA-Z\-]+))?/);
      if (match) {
        const pkg = match[1].toLowerCase();
        const ver = match[2] || 'latest';
        deps[pkg] = ver;
      }
    }

    return deps;
  }

  private mapConfiguration(): ConfigurationInfo {
    // Check TS first, fallback to JS
    const rawConfig = this.loader.readRawFile('playwright.config.ts') || this.loader.readRawFile('playwright.config.js');
    if (!rawConfig) return {};

    const extractRegex = (regex: RegExp, content: string): string | undefined => {
      const match = content.match(regex);
      return match ? match[1] : undefined;
    };

    const workersRaw = extractRegex(/workers:\s*(\d+|['"][a-zA-Z0-9_]+['"])/, rawConfig);
    const fullyParallelRaw = extractRegex(/fullyParallel:\s*(true|false)/, rawConfig);
    const timeoutRaw = extractRegex(/timeout:\s*(\d+)/, rawConfig);
    const expectTimeoutRaw = extractRegex(/expect:\s*\{\s*timeout:\s*(\d+)/, rawConfig);
    const baseURL = extractRegex(/baseURL:\s*['"]([^'"]+)['"]/, rawConfig);
    const trace = extractRegex(/trace:\s*['"]([^'"]+)['"]/, rawConfig);
    const video = extractRegex(/video:\s*['"]([^'"]+)['"]/, rawConfig);
    const screenshot = extractRegex(/screenshot:\s*['"]([^'"]+)['"]/, rawConfig);
    const storageState = extractRegex(/storageState:\s*['"]([^'"]+)['"]/, rawConfig);

    // Extract projects
    const projects: string[] = [];
    const projectMatches = rawConfig.matchAll(/name:\s*['"]([^'"]+)['"]/g);
    for (const match of projectMatches) {
      if (match[1] && !projects.includes(match[1])) {
        projects.push(match[1]);
      }
    }

    return {
      workers: workersRaw ? (isNaN(Number(workersRaw)) ? workersRaw.replace(/['"]/g, '') : Number(workersRaw)) : undefined,
      fullyParallel: fullyParallelRaw ? fullyParallelRaw === 'true' : undefined,
      timeout: timeoutRaw ? Number(timeoutRaw) : undefined,
      expectTimeout: expectTimeoutRaw ? Number(expectTimeoutRaw) : undefined,
      projects: projects.length > 0 ? projects : undefined,
      trace,
      video,
      screenshot,
      baseURL,
      storageState,
    };
  }

  private mapPageObjects(pagesDir?: string): PageObjectInfo[] {
    if (!pagesDir) return [];
    
    const files = this.loader.scanDirectory(pagesDir, ['.ts', '.js', '.tsx', '.jsx', '.py']);
    const poms: PageObjectInfo[] = [];

    for (const file of files) {
      const content = this.loader.readRawFile(file);
      if (!content) continue;

      const isPython = file.endsWith('.py');

      // Match class declaration (handling optional inheritance LoginPage(BasePage, ABC))
      const classMatch = isPython 
        ? content.match(/class\s+([a-zA-Z0-9_]+)(?:\s*\([^)]*\))?\s*:/)
        : content.match(/class\s+([a-zA-Z0-9_]+)/);
      if (!classMatch) continue;

      // Match methods
      const methods: string[] = [];
      if (isPython) {
        const methodMatches = content.matchAll(/(?:def|async\s+def)\s+([a-zA-Z0-9_]+)\s*\(/g);
        for (const match of methodMatches) {
          if (match[1] && match[1] !== '__init__' && !methods.includes(match[1])) {
            methods.push(match[1]);
          }
        }
      } else {
        const methodMatches = content.matchAll(/async\s+([a-zA-Z0-9_]+)\s*\(/g);
        for (const match of methodMatches) {
          if (match[1] && match[1] !== 'constructor' && !methods.includes(match[1])) {
            methods.push(match[1]);
          }
        }
      }

      poms.push({
        className: classMatch[1],
        filePath: file,
        methods,
      });
    }

    return poms;
  }

  private mapFixtures(fixturesDir?: string): FixtureInfo[] {
    const fixtures: FixtureInfo[] = [];

    // Scan specific directory if exists
    if (fixturesDir) {
      const files = this.loader.scanDirectory(fixturesDir, ['.ts', '.js', '.tsx', '.jsx', '.py']);
      for (const file of files) {
        const ext = path.extname(file);
        const name = path.basename(file, ext);
        
        if (ext === '.py') {
          // If it is a Python file, parse individual @pytest.fixture functions
          const content = this.loader.readRawFile(file);
          if (content) {
            const fixtureMatches = content.matchAll(/@(?:pytest\.)?fixture(?:\s*\([^)]*\))?\s*\r?\n\s*(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\(/g);
            let foundAny = false;
            for (const match of fixtureMatches) {
              if (match[1]) {
                fixtures.push({ name: match[1], filePath: file });
                foundAny = true;
              }
            }
            if (!foundAny) {
              fixtures.push({ name, filePath: file });
            }
          } else {
            fixtures.push({ name, filePath: file });
          }
        } else {
          fixtures.push({ name, filePath: file });
        }
      }
    }

    // Also check for standalone fixtures inside tests/ or examples/ or conftest.py
    const rootFixtures = [
      'tests/fixtures.ts', 'examples/fixtures.ts', 'fixtures.ts',
      'tests/fixtures.js', 'examples/fixtures.js', 'fixtures.js',
      'tests/conftest.py', 'conftest.py'
    ];
    for (const item of rootFixtures) {
      const content = this.loader.readRawFile(item);
      if (content) {
        const ext = path.extname(item);
        if (ext === '.py') {
          // Parse conftest.py fixtures
          const fixtureMatches = content.matchAll(/@(?:pytest\.)?fixture(?:\s*\([^)]*\))?\s*\r?\n\s*(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\(/g);
          let foundAny = false;
          for (const match of fixtureMatches) {
            if (match[1]) {
              fixtures.push({ name: match[1], filePath: item });
              foundAny = true;
            }
          }
          if (!foundAny) {
            fixtures.push({ name: path.basename(item, ext), filePath: item });
          }
        } else {
          fixtures.push({ name: path.basename(item, ext), filePath: item });
        }
      }
    }

    return fixtures;
  }

  private detectFramework(deps: DependencyInfo, content: string): string {
    // 1. Differentiate by file content imports first (essential for multi-framework repos)
    if (
      content.includes('from selenium import') ||
      content.includes('import selenium') ||
      content.includes('webdriver.Chrome(') ||
      content.includes('webdriver.Firefox(') ||
      content.includes('webdriver.Remote(')
    ) {
      return 'Selenium';
    }

    if (
      content.includes('@playwright/test') ||
      content.includes('from playwright') ||
      content.includes('import playwright')
    ) {
      return 'Playwright';
    }

    // 2. Fallback to package dependency checks
    if (
      content.includes('selenium-webdriver') ||
      /\bnew\s+Builder\s*\(\s*\)/.test(content) ||
      /\bdriver\.findElement\s*\(/.test(content) ||
      deps.devDependencies['selenium-webdriver'] ||
      deps.dependencies['selenium-webdriver'] ||
      deps.dependencies['selenium']
    ) {
      return 'Selenium';
    }

    if (
      deps.playwrightVersion ||
      deps.dependencies['playwright']
    ) {
      return 'Playwright';
    }

    if (
      deps.devDependencies['cypress'] ||
      deps.dependencies['cypress'] ||
      content.includes('cy.')
    ) {
      return 'Cypress';
    }

    return 'Unknown';
  }

  private detectTestRunner(filePath: string, deps: DependencyInfo, content: string): string {
    const isPython = filePath.endsWith('.py');
    if (isPython) {
      // 1. Differentiate by file content imports first
      if (content.includes('import pytest') || content.includes('from pytest')) {
        return 'pytest';
      }
      if (content.includes('import unittest') || content.includes('from unittest') || content.includes('unittest.TestCase')) {
        return 'unittest';
      }
      // 2. Differentiate by package dependencies next
      if (deps.dependencies['pytest']) {
        return 'pytest';
      }
      if (deps.dependencies['unittest']) {
        return 'unittest';
      }
      return 'pytest'; // Default fallback for Python test files
    }

    if (content.includes('@playwright/test') || deps.playwrightVersion) {
      return 'playwright-runner';
    }

    if (content.includes('describe(') || content.includes('it(') || content.includes('test(')) {
      if (deps.devDependencies['jest'] || deps.dependencies['jest']) {
        return 'jest';
      }
      if (deps.devDependencies['mocha'] || deps.dependencies['mocha']) {
        return 'mocha';
      }
    }

    return 'Unknown';
  }

  private detectFeature(filePath: string, content: string): string {
    const describeMatch = content.match(/test\.describe\s*\(\s*['"]([^'"]+)['"]/i);
    const describeTitle = describeMatch ? describeMatch[1].toLowerCase() : '';

    const importedPOMs: string[] = [];
    const importMatches = content.matchAll(/import\s+.*\b([a-zA-Z0-9_]+Page)\b/g);
    for (const match of importMatches) {
      if (match[1]) importedPOMs.push(match[1].toLowerCase());
    }

    const requireMatches = content.matchAll(/(?:const|let|var)\s+.*?([a-zA-Z0-9_]+Page).*?=\s*require\s*\(/g);
    for (const match of requireMatches) {
      if (match[1]) importedPOMs.push(match[1].toLowerCase());
    }

    const combined = (filePath + ' ' + describeTitle + ' ' + importedPOMs.join(' ') + ' ' + content).toLowerCase();
    
    if (combined.includes('login') || combined.includes('auth') || combined.includes('session') || combined.includes('signin') || combined.includes('loginpage')) {
      return 'Authentication';
    }
    if (combined.includes('search') || combined.includes('filter') || combined.includes('searchpage')) {
      return 'Search';
    }
    if (combined.includes('checkout') || combined.includes('payment') || combined.includes('cart') || combined.includes('checkoutpage') || combined.includes('cartpage')) {
      return 'Checkout';
    }
    if (combined.includes('upload') || combined.includes('download') || combined.includes('file')) {
      return 'File Management';
    }
    if (combined.includes('api/') || combined.includes('request.') || combined.includes('http')) {
      return 'API';
    }
    
    return 'General UI';
  }
}
