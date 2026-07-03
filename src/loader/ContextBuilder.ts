import { RepositoryLoader } from './RepositoryLoader';
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

    const targetFile: TargetFileInfo = {
      filePath: targetFilePath,
      content: targetFileContent,
      detectedFramework,
      detectedFeature,
    };

    return {
      repositoryInfo,
      dependencies,
      configuration,
      pageObjects,
      fixtures,
      targetFile,
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

    if (!rawPackage) return defaultInfo;

    try {
      const parsed = JSON.parse(rawPackage);
      const devDeps = parsed.devDependencies || {};
      const deps = parsed.dependencies || {};

      const playwrightVersion = devDeps['@playwright/test'] || deps['@playwright/test'];

      return {
        playwrightVersion,
        devDependencies: devDeps,
        dependencies: deps,
        hasESLint: !!(devDeps['eslint'] || deps['eslint']),
        hasPrettier: !!(devDeps['prettier'] || deps['prettier']),
        hasHusky: !!(devDeps['husky'] || deps['husky']),
        hasLintStaged: !!(devDeps['lint-staged'] || deps['lint-staged']),
      };
    } catch {
      return defaultInfo;
    }
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
    
    const files = this.loader.scanDirectory(pagesDir, '.ts');
    const poms: PageObjectInfo[] = [];

    for (const file of files) {
      const content = this.loader.readRawFile(file);
      if (!content) continue;

      // Match class declaration
      const classMatch = content.match(/class\s+([a-zA-Z0-9_]+)/);
      if (!classMatch) continue;

      // Match async methods
      const methods: string[] = [];
      const methodMatches = content.matchAll(/async\s+([a-zA-Z0-9_]+)\s*\(/g);
      for (const match of methodMatches) {
        if (match[1] && match[1] !== 'constructor' && !methods.includes(match[1])) {
          methods.push(match[1]);
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
      const files = this.loader.scanDirectory(fixturesDir, '.ts');
      for (const file of files) {
        fixtures.push({ name: path.basename(file, '.ts'), filePath: file });
      }
    }

    // Also check for standalone fixtures.ts inside tests/ or examples/
    const rootFixtures = ['tests/fixtures.ts', 'examples/fixtures.ts', 'fixtures.ts'];
    for (const item of rootFixtures) {
      const content = this.loader.readRawFile(item);
      if (content) {
        fixtures.push({ name: 'fixtures', filePath: item });
      }
    }

    return fixtures;
  }

  private detectFramework(deps: DependencyInfo, content: string): string {
    if (deps.playwrightVersion || content.includes('@playwright/test')) return 'Playwright';
    if (deps.devDependencies['cypress'] || deps.dependencies['cypress'] || content.includes('cy.')) return 'Cypress';
    if (content.includes('selenium-webdriver')) return 'Selenium';
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
