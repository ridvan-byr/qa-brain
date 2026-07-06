import { Scanner } from '../core/Scanner';

export interface ChangedFile {
  filename: string;
  status: string; // 'added' | 'modified' | 'removed' | 'renamed'
}

export class DiffDetector {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Fetches the list of changed files from a Pull Request.
   */
  async getChangedFiles(owner: string, repo: string, prNumber: number): Promise<ChangedFile[]> {
    const { getOctokit } = await import('@actions/github');
    const octokit = getOctokit(this.token);

    const files: ChangedFile[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
        per_page: perPage,
        page,
      });

      for (const file of response.data) {
        files.push({
          filename: file.filename,
          status: file.status,
        });
      }

      if (response.data.length < perPage) break;
      page++;
    }

    return files;
  }

  /**
   * Filters the list of changed files to only include Playwright test files.
   * Excludes removed files (no content to review).
   */
  filterTestFiles(files: ChangedFile[], ignorePatterns: string[] = []): string[] {
    return files
      .filter(f => f.status !== 'removed')
      .map(f => f.filename)
      .filter(name => Scanner.isReviewableTestFile(name))
      .filter(name => !this.matchesIgnorePattern(name, ignorePatterns));
  }

  /**
   * Checks if a filename matches any of the ignore glob patterns.
   * Supports simple glob patterns: * matches any segment, ** matches any path.
   */
  private matchesIgnorePattern(filename: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      const regex = this.globToRegex(pattern);
      if (regex.test(filename)) {
        return true;
      }
    }
    return false;
  }

  private globToRegex(glob: string): RegExp {
    let regexStr = glob
      .replace(/\*\*\//g, '{{GLOBSTAR_SLASH}}')
      .replace(/\/\*\*/g, '{{SLASH_GLOBSTAR}}')
      .replace(/\*\*/g, '{{GLOBSTAR}}')
      .replace(/\*/g, '{{STAR}}');

    regexStr = regexStr.replace(/\./g, '\\.');

    regexStr = regexStr
      .replace(/\{\{GLOBSTAR_SLASH\}\}/g, '(?:^|.*?\\/)')
      .replace(/\{\{SLASH_GLOBSTAR\}\}/g, '(?:\\/.*)?')
      .replace(/\{\{GLOBSTAR\}\}/g, '.*')
      .replace(/\{\{STAR\}\}/g, '[^/]*');

    return new RegExp(`^${regexStr}$`);
  }
}
