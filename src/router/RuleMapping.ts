export type RoutingSignal = 'Locator' | 'Timeout' | 'Isolation' | 'Assertion';

export interface RoutingRuleMapping {
  signal: RoutingSignal;
  rule: string;
  generic: boolean;
  adapterEvidence: string[];
  knowledgeFiles: string[];
}

export const PLAYWRIGHT_ROUTING_RULES: RoutingRuleMapping[] = [
  {
    signal: 'Locator',
    rule: 'Brittle Locator',
    generic: false,
    adapterEvidence: ['Playwright LocatorSignal'],
    knowledgeFiles: [
      'knowledge/playwright/review-rules/locator-review.md',
      'knowledge/playwright/fundamentals/locators.md',
      'knowledge/google/maintainability.md',
    ],
  },
  {
    signal: 'Timeout',
    rule: 'Auto Waiting',
    generic: false,
    adapterEvidence: ['Playwright WaitSignal'],
    knowledgeFiles: [
      'knowledge/playwright/review-rules/waiting-review.md',
      'knowledge/playwright/fundamentals/auto-waiting.md',
      'knowledge/google/flaky-tests.md',
    ],
  },
  {
    signal: 'Isolation',
    rule: 'Test Isolation',
    generic: true,
    adapterEvidence: ['LifecycleSignal'],
    knowledgeFiles: [
      'knowledge/playwright/review-rules/isolation-review.md',
      'knowledge/playwright/review-rules/parallel-review.md',
      'knowledge/google/test-isolation.md',
    ],
  },
  {
    signal: 'Assertion',
    rule: 'Missing Assertion',
    generic: true,
    adapterEvidence: ['AssertionSignal'],
    knowledgeFiles: [
      'knowledge/playwright/review-rules/assertion-review.md',
      'knowledge/playwright/fundamentals/assertions.md',
    ],
  },
];

export function getKnowledgeFilesForSignals(signals: Set<string>): string[] {
  return PLAYWRIGHT_ROUTING_RULES
    .filter(mapping => signals.has(mapping.signal))
    .flatMap(mapping => mapping.knowledgeFiles);
}
