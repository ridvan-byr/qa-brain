import type {
  FrameworkAdapter,
  FrameworkContext,
  FrameworkDetectionInput,
  FrameworkSignal,
  KnowledgeProfile,
} from '../types';
import { getBaseKnowledgeFiles, getKnowledgeFilesForSignals } from '../KnowledgeProfiles';
import { hasAssertionSignal } from '../../utils/assertionHelper';

export class SeleniumAdapter implements FrameworkAdapter {
  public readonly name = 'selenium' as const;

  public detect(input: FrameworkDetectionInput): boolean {
    const content = input.targetFile.content;
    return Boolean(input.dependencies.dependencies['selenium-webdriver'])
      || Boolean(input.dependencies.devDependencies['selenium-webdriver'])
      || content.includes('selenium-webdriver')
      || /\bnew\s+Builder\s*\(\s*\)/.test(content)
      || /\bdriver\.findElement\s*\(/.test(content);
  }

  public buildContext(input: FrameworkDetectionInput): FrameworkContext {
    const version = input.dependencies.dependencies['selenium-webdriver']
      || input.dependencies.devDependencies['selenium-webdriver'];

    return {
      framework: 'selenium',
      targetFile: input.targetFile,
      metadata: {
        detectedFeature: input.targetFile.detectedFeature,
        seleniumWebDriverVersion: version,
      },
    };
  }

  public buildSignals(context: FrameworkContext): FrameworkSignal[] {
    const content = context.targetFile.content;
    const file = context.targetFile.filePath;
    const signals: FrameworkSignal[] = [];

    if (/\bBy\.(?:xpath|css|id|name|className|linkText|partialLinkText)\s*\(/.test(content) || /\bdriver\.findElement\s*\(/.test(content)) {
      signals.push(this.signal('locator', file, this.findLine(content, /By\.(?:xpath|css|id|name|className|linkText|partialLinkText)\s*\(|driver\.findElement\s*\(/), ['locator', 'maintainability']));
    }

    if (/\bdriver\.sleep\s*\(/.test(content) || /\buntil\.\w+\s*\(/.test(content)) {
      signals.push(this.signal('wait', file, this.findLine(content, /driver\.sleep\s*\(|until\.\w+\s*\(/), ['waiting', 'flakiness']));
    }

    if (/\bnew\s+Builder\s*\(\s*\).*\.build\s*\(/s.test(content) || /\bdriver\.quit\s*\(/.test(content)) {
      signals.push(this.signal('lifecycle', file, this.findLine(content, /new\s+Builder\s*\(\s*\)|driver\.quit\s*\(/), ['cleanup', 'lifecycle']));
    }

    if (!this.hasAssertionSignal(content)) {
      signals.push(this.signal('assertion', file, this.findLine(content, /\bit\s*\(|\btest\s*\(|\bdescribe\s*\(/), ['assertion']));
    }

    if (/class\s+\w+Page\b/.test(content) || /\b\w+Page\b/.test(content)) {
      signals.push(this.signal('structure', file, this.findLine(content, /\b\w+Page\b/), ['page-object', 'structure']));
    }

    return signals;
  }

  public knowledgeProfile(signals: FrameworkSignal[]): KnowledgeProfile {
    const routingSignals = new Set<string>();

    for (const signal of signals) {
      if (signal.ruleHints.includes('locator')) routingSignals.add('Locator');
      if (signal.ruleHints.includes('waiting')) routingSignals.add('Timeout');
      if (signal.ruleHints.includes('cleanup')) routingSignals.add('Cleanup');
      if (signal.ruleHints.includes('assertion')) routingSignals.add('Assertion');
    }

    return {
      baseKnowledgeFiles: getBaseKnowledgeFiles('selenium'),
      ruleFiles: getKnowledgeFilesForSignals('selenium', routingSignals),
      genericKnowledgeFiles: [],
    };
  }

  private signal(type: FrameworkSignal['type'], file: string, evidence: string, ruleHints: string[]): FrameworkSignal {
    return {
      type,
      framework: 'selenium',
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

  private hasAssertionSignal(content: string): boolean {
    return hasAssertionSignal(content);
  }
}
