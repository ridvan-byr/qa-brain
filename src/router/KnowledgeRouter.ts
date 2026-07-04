import type { ReviewContext } from '../types/ReviewContext';
import type { FrameworkName, FrameworkSignal } from '../framework/types';
import { getBaseKnowledgeFiles, getKnowledgeFilesForSignals } from '../framework/KnowledgeProfiles';

export class KnowledgeRouter {
  /**
   * Scans target file for patterns, emits signals, and routes to corresponding knowledge files.
   */
  public routeKnowledge(context: ReviewContext): string[] {
    const files: string[] = [];
    const content = context.targetFile.content;
    const frameworkBehaviorContext = this.isFrameworkBehaviorContext(context.targetFile.filePath, content);

    // Stop Loading Rule: If not a supported framework, stop loading rules
    if (context.targetFile.detectedFramework === 'Unknown') {
      return [];
    }

    const framework = this.resolveFrameworkName(context);
    files.push(...getBaseKnowledgeFiles(framework));

    const signals = this.resolveRoutingSignals(context, frameworkBehaviorContext);

    files.push(...getKnowledgeFilesForSignals(framework, signals));

    // Feature-specific routing
    if (context.targetFile.detectedFeature === 'Authentication') {
      files.push('knowledge/owasp/authentication-testing.md');
      files.push('knowledge/istqb/boundary-value-analysis.md');
    } else if (context.targetFile.detectedFeature === 'Search') {
      files.push('knowledge/owasp/input-validation.md');
      files.push('knowledge/unicode/unicode-testing.md');
    }

    return files;
  }

  private resolveFrameworkName(context: ReviewContext): FrameworkName {
    if (context.framework?.adapterName) {
      return context.framework.adapterName;
    }

    if (context.targetFile.detectedFramework === 'Playwright') {
      return 'playwright';
    }

    return 'unknown';
  }

  private resolveRoutingSignals(context: ReviewContext, frameworkBehaviorContext: boolean): Set<string> {
    const adapterSignals = context.framework?.signals || [];
    if (adapterSignals.length > 0) {
      return this.mapAdapterSignals(adapterSignals, frameworkBehaviorContext);
    }

    return this.detectHeuristicSignals(context.targetFile.content, frameworkBehaviorContext);
  }

  private mapAdapterSignals(adapterSignals: FrameworkSignal[], frameworkBehaviorContext: boolean): Set<string> {
    const signals = new Set<string>();

    for (const signal of adapterSignals) {
      if (signal.type === 'locator') {
        signals.add('Locator');
      }
      if (signal.type === 'wait') {
        signals.add('Timeout');
      }
      if (signal.type === 'lifecycle') {
        signals.add('Isolation');
      }
      if (signal.type === 'assertion' && !frameworkBehaviorContext) {
        signals.add('Assertion');
      }
    }

    return signals;
  }

  private detectHeuristicSignals(content: string, frameworkBehaviorContext: boolean): Set<string> {
    const signals = new Set<string>();

    // 1. Signal: Locator (XPath, CSS, locator calls)
    if (content.includes('xpath=') || content.includes('//') || content.includes('nth-child') || content.includes('locator(')) {
      signals.add('Locator');
    }

    // 2. Signal: Timeout (waitForTimeout, sleeps)
    if (content.includes('waitForTimeout') || content.includes('page.waitForTimeout') || content.includes('waitForLoadState')) {
      signals.add('Timeout');
    }

    // 3. Signal: Isolation (global mutables or session shares)
    if (this.hasTopLevelMutableState(content) || content.includes('browser.newContext(')) {
      signals.add('Isolation');
    }

    // 4. Signal: Assertion (Check if assertions are missing or weak)
    if (!this.hasAssertionSignal(content) && !frameworkBehaviorContext) {
      signals.add('Assertion');
    }

    return signals;
  }

  private hasTopLevelMutableState(content: string): boolean {
    let braceDepth = 0;
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (braceDepth === 0 && /^let\s+[a-zA-Z0-9_]+\s*=/.test(trimmed)) {
        return true;
      }
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;
      if (braceDepth < 0) braceDepth = 0;
    }
    return false;
  }

  private hasAssertionSignal(content: string): boolean {
    return [
      /\bexpect\s*\(/,
      /\bassert\w*\s*\./,
      /\bassert\w*\s*\(/,
      /\bEnsure\.that\s*\(/,
      /\bCheck\.whether\s*\(/,
      /\bactor\.attemptsTo\s*\(/,
      /\battemptsTo\s*\(/,
      /\bseeIf\s*\(/,
      /\bexpectationTo\w+\s*\(/,
      /\btoEqual\s*\(/,
      /\btoBe\s*\(/,
      /\btoContain\s*\(/,
      /\btoHave\w+\s*\(/,
      /\bresponse\.(?:ok|status)\s*\(/,
      /\brequest\.(?:get|post|put|patch|delete)\s*\(/,
      /\bshortest\s*\(/,
      /\btest\.(?:skip|fixme|fail)\s*\(/,
    ].some(pattern => pattern.test(content));
  }

  private isFrameworkBehaviorContext(filePath: string, content: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    const pathOnlyFrameworkContexts = [
      /\/serenity-js\/examples\//,
      /\/serenity-js\/integration\/playwright-test\/examples\//,
      /\/serenity-js\/integration\/playwright-electron\/spec\/electron\//,
      /\/demo\.playwright\//,
      /\/demo-playwright\//,
      /\/android\/tests\/example\.spec\./,
      /\/chrome-extension\/tests\/example\.spec\./,
    ];

    if (pathOnlyFrameworkContexts.some(pattern => pattern.test(normalizedPath))) {
      return true;
    }

    const contextPathPatterns = [
      /\/examples?\//,
      /\/outcomes?\//,
      /\/skipped?\//,
      /\/failing\//,
      /\/compatibility\//,
      /\/demo[\w.-]*\//,
      /\/example\.spec\./,
      /\/example\.test\./,
    ];

    if (!contextPathPatterns.some(pattern => pattern.test(normalizedPath))) {
      return false;
    }

    const frameworkBehaviorSignals = [
      /\btest\s*\(\s*['"`][^'"`]*(?:passes|fails|skipped?|fixme|expected failure|unexpected pass|describe blocks|reporter|compatibility|configurationerror|global, worker-level error)/i,
      /\btest\.(?:skip|fixme|fail)\s*\(/,
      /\bdescribe\s*\(\s*['"`][^'"`]*(?:outcomes?|reporters?|compatibility|examples?)/i,
      /Serenity\/JS/i,
      /native reporters?/i,
      /custom tags?/i,
    ];

    return frameworkBehaviorSignals.some(pattern => pattern.test(content));
  }
}
