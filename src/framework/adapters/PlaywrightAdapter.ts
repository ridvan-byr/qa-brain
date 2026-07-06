import type {
  FrameworkAdapter,
  FrameworkContext,
  FrameworkDetectionInput,
  FrameworkSignal,
  KnowledgeProfile,
} from '../types';
import { getBaseKnowledgeFiles, getKnowledgeFilesForSignals } from '../KnowledgeProfiles';
import { hasAssertionSignal } from '../../utils/assertionHelper';

export class PlaywrightAdapter implements FrameworkAdapter {
  public readonly name = 'playwright';

  public detect(input: FrameworkDetectionInput): boolean {
    const content = input.targetFile.content;
    return Boolean(input.dependencies.playwrightVersion)
      || content.includes('@playwright/test')
      || /\bpage\./.test(content)
      || /\btest\.step\s*\(/.test(content);
  }

  public buildContext(input: FrameworkDetectionInput): FrameworkContext {
    return {
      framework: 'playwright',
      targetFile: input.targetFile,
      metadata: {
        detectedFeature: input.targetFile.detectedFeature,
        playwrightVersion: input.dependencies.playwrightVersion,
      },
    };
  }

  public buildSignals(context: FrameworkContext): FrameworkSignal[] {
    const content = context.targetFile.content;
    const file = context.targetFile.filePath;
    const signals: FrameworkSignal[] = [];

    if (content.includes('xpath=') || content.includes('//') || content.includes('nth-child') || content.includes('locator(')) {
      signals.push(this.signal('locator', file, this.findLine(content, /xpath=|\/\/|nth-child|locator\(/), ['locator', 'maintainability']));
    }

    if (content.includes('waitForTimeout') || content.includes('page.waitForTimeout') || content.includes('waitForLoadState')) {
      signals.push(this.signal('wait', file, this.findLine(content, /waitForTimeout|waitForLoadState/), ['waiting', 'flakiness']));
    }

    if (this.hasTopLevelMutableState(content) || content.includes('browser.newContext(')) {
      signals.push(this.signal('lifecycle', file, this.findLine(content, /^let\s+\w+\s*=|browser\.newContext\(/m), ['isolation', 'parallel']));
    }

    if (!this.hasAssertionSignal(content)) {
      signals.push(this.signal('assertion', file, this.findLine(content, /test\s*\(/), ['assertion']));
    }

    if (/class\s+\w+Page\b/.test(content) || /\b\w+Page\b/.test(content)) {
      signals.push(this.signal('page-object', file, this.findLine(content, /\b\w+Page\b/), ['page-object']));
    }

    return signals;
  }

  public knowledgeProfile(signals: FrameworkSignal[]): KnowledgeProfile {
    const routingSignals = new Set<string>();

    for (const signal of signals) {
      if (signal.ruleHints.includes('locator')) {
        routingSignals.add('Locator');
      }
      if (signal.ruleHints.includes('waiting')) {
        routingSignals.add('Timeout');
      }
      if (signal.ruleHints.includes('isolation')) {
        routingSignals.add('Isolation');
      }
      if (signal.ruleHints.includes('assertion')) {
        routingSignals.add('Assertion');
      }
    }

    return {
      baseKnowledgeFiles: getBaseKnowledgeFiles('playwright'),
      ruleFiles: getKnowledgeFilesForSignals('playwright', routingSignals),
      genericKnowledgeFiles: [],
    };
  }

  private signal(type: FrameworkSignal['type'], file: string, evidence: string, ruleHints: string[]): FrameworkSignal {
    return {
      type,
      framework: 'playwright',
      ruleHints,
      evidence,
      location: { file },
    };
  }

  private findLine(content: string, pattern: RegExp): string {
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .find(line => pattern.test(line)) || '';
  }

  private hasTopLevelMutableState(content: string): boolean {
    let braceDepth = 0;
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (braceDepth === 0 && /^let\s+\w+\s*=/.test(trimmed)) {
        return true;
      }
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;
      if (braceDepth < 0) braceDepth = 0;
    }
    return false;
  }

  private hasAssertionSignal(content: string): boolean {
    return hasAssertionSignal(content);
  }
}
