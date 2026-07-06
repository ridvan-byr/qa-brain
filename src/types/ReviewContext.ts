import type { FrameworkAdapterResult } from '../framework/types';

export interface RepositoryInfo {
  path: string;
  structure: {
    testsDir?: string;
    pagesDir?: string;
    fixturesDir?: string;
    utilsDir?: string;
    dataDir?: string;
  };
}

export interface DependencyInfo {
  playwrightVersion?: string;
  seleniumVersion?: string;
  devDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  hasESLint: boolean;
  hasPrettier: boolean;
  hasHusky: boolean;
  hasLintStaged: boolean;
}

export interface ConfigurationInfo {
  workers?: number | string;
  fullyParallel?: boolean;
  timeout?: number;
  expectTimeout?: number;
  projects?: string[];
  trace?: string;
  video?: string;
  screenshot?: string;
  baseURL?: string;
  storageState?: string;
}

export interface PageObjectInfo {
  className: string;
  filePath: string;
  methods: string[];
}

export interface FixtureInfo {
  name: string;
  filePath: string;
}

export interface TargetFileInfo {
  filePath: string;
  content: string;
  detectedFramework: string;
  detectedFeature: string;
  detectedTestRunner?: string;
}

export interface ReviewContext {
  repositoryInfo: RepositoryInfo;
  dependencies: DependencyInfo;
  configuration: ConfigurationInfo;
  pageObjects: PageObjectInfo[];
  fixtures: FixtureInfo[];
  targetFile: TargetFileInfo;
  framework?: FrameworkAdapterResult;
}
