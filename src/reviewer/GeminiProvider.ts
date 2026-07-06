import type { LLMProvider } from './LLMProvider';
import type { ReviewContext } from '../types/ReviewContext';
import type { Finding } from '../types/Finding';
import type { ReviewResult } from '../types/ReviewResult';
import type { TestDesignResult } from '../types/TestDesignResult';

try {
  require('dotenv').config();
} catch {
  // The VS Code extension runs from a packaged core without root node_modules.
  // Missing dotenv should not prevent deterministic rule-only reviews.
}

export class GeminiProvider implements LLMProvider {
  private apiKey?: string;
  private provider: string;
  private model: string;
  private endpoint: string;

  constructor(apiKey?: string, provider?: string, model?: string, endpoint?: string) {
    this.provider = provider || process.env.QA_BRAIN_PROVIDER || 'Gemini';
    this.apiKey = apiKey === undefined
      ? (this.provider === 'Gemini' ? (process.env.GEMINI_API_KEY || process.env.QA_BRAIN_API_KEY) : process.env.QA_BRAIN_API_KEY)
      : apiKey;
    this.model = model || process.env.QA_BRAIN_MODEL || '';
    this.endpoint = endpoint || process.env.QA_BRAIN_ENDPOINT || '';
  }

  private async makeRequest(url: string, headers: Record<string, string>, body: any): Promise<any> {
    const payload = JSON.stringify(body);
    if (typeof globalThis.fetch === 'function') {
      const response = await globalThis.fetch(url, {
        method: 'POST',
        headers,
        body: payload,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      }
      return await response.json();
    } else {
      const https = require('https');
      const { URL } = require('url');
      return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
          method: 'POST',
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname + parsedUrl.search,
          headers: {
            ...headers,
            'Content-Length': Buffer.byteLength(payload),
            'Content-Type': 'application/json'
          },
        };
        const req = https.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
              reject(new Error(`HTTP Error ${res.statusCode}: ${data}`));
            } else {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    }
  }

  private cleanJsonText(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\r?\n/, '');
      clean = clean.replace(/\r?\n```$/, '');
      clean = clean.trim();
    }
    return clean;
  }

  public async review(context: ReviewContext, ruleContents: string[]): Promise<Omit<ReviewResult, 'score'>> {
    if (!this.apiKey) {
      return this.generateRuleEngineReview(context);
    }

    const systemInstruction = 'You are QA Brain Reviewer. Match findings and output JSON matching response-format.md schema.';
    const userPrompt = `
      Review Context:
      ${JSON.stringify(context, null, 2)}

      Rule Sets Loaded:
      ${ruleContents.join('\n\n')}

      Target Code to Review:
      ${context.targetFile.content}
    `;

    try {
      let rawText = '';

      if (this.provider === 'Gemini') {
        const modelName = this.model || 'gemini-2.5-flash';
        if (this.endpoint) {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          };
          const body = {
            model: modelName,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userPrompt }
            ]
          };
          const response = await this.makeRequest(this.endpoint, headers, body);
          rawText = response.choices?.[0]?.message?.content || '{}';
        } else {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: this.apiKey });
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
            },
          });
          rawText = response.text || '{}';
        }
      } else if (this.provider === 'OpenAI') {
        const modelName = this.model || 'gpt-4o';
        const url = this.endpoint || 'https://api.openai.com/v1/chat/completions';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        };
        const body = {
          model: modelName,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        };
        const response = await this.makeRequest(url, headers, body);
        rawText = response.choices?.[0]?.message?.content || '{}';
      } else if (this.provider === 'Anthropic') {
        const modelName = this.model || 'claude-3-5-sonnet-latest';
        const url = this.endpoint || 'https://api.anthropic.com/v1/messages';
        const headers = {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        };
        const body = {
          model: modelName,
          max_tokens: 4000,
          system: systemInstruction,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        };
        const response = await this.makeRequest(url, headers, body);
        rawText = response.content?.[0]?.text || '{}';
      } else if (this.provider === 'OpenRouter') {
        const modelName = this.model || 'google/gemini-2.5-flash';
        const url = this.endpoint || 'https://openrouter.ai/api/v1/chat/completions';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/ridvan-byr/qa-brain',
          'X-Title': 'QA Brain'
        };
        const body = {
          model: modelName,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        };
        const response = await this.makeRequest(url, headers, body);
        rawText = response.choices?.[0]?.message?.content || '{}';
      }

      const parsed = JSON.parse(this.cleanJsonText(rawText));

      return {
        summary: parsed.summary || 'No summary provided.',
        findings: parsed.findings || [],
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        observations: parsed.observations || [],
        references: parsed.references || [],
        finalVerdict: parsed.finalVerdict || 'Needs Improvement',
      };
    } catch (error) {
      console.warn(`${this.provider} API call failed, falling back to deterministic rule review.`, error);
      return this.generateRuleEngineReview(context);
    }
  }

  public async designTests(context: ReviewContext, ruleContents: string[]): Promise<TestDesignResult> {
    if (!this.apiKey) {
      return this.generateRuleEngineTestDesign(context);
    }

    const systemInstruction = `You are QA Brain Test Design Engine. Analyze target test files, identify missing test design scenarios (applying ISTQB Boundary Value Analysis, Equivalence Partitioning, security validation, and data variation principles), explain the QA rationale for each, and output valid JSON matching the TestDesignResult schema.

For each missing scenario, provide:
- id: unique string (e.g., TS_001)
- title: concise title
- category: one of 'Boundary Value', 'Equivalence Partitioning', 'Security', 'Error Path', 'Data Variation'
- description: what to verify
- explanation: educational reason detailing why it is missing and why it's a critical QA practice (e.g. explain what boundary or partition is missed)
- criticality: 'HIGH' | 'MEDIUM' | 'LOW'
- evidence: line or context in existing code showing this gap
- suggestedTemplate: boilerplate test code for both 'playwright' and 'selenium' frameworks.

Output JSON only. Do not wrap in markdown or add notes.`;

    const userPrompt = `
      Review Context:
      ${JSON.stringify(context, null, 2)}

      Rule Sets Loaded:
      ${ruleContents.join('\n\n')}

      Target Code to Analyze:
      ${context.targetFile.content}
    `;

    try {
      let rawText = '';

      if (this.provider === 'Gemini') {
        const modelName = this.model || 'gemini-2.5-flash';
        if (this.endpoint) {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          };
          const body = {
            model: modelName,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userPrompt }
            ]
          };
          const response = await this.makeRequest(this.endpoint, headers, body);
          rawText = response.choices?.[0]?.message?.content || '{}';
        } else {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: this.apiKey });
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
            },
          });
          rawText = response.text || '{}';
        }
      } else if (this.provider === 'OpenAI') {
        const modelName = this.model || 'gpt-4o';
        const url = this.endpoint || 'https://api.openai.com/v1/chat/completions';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        };
        const body = {
          model: modelName,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        };
        const response = await this.makeRequest(url, headers, body);
        rawText = response.choices?.[0]?.message?.content || '{}';
      } else if (this.provider === 'Anthropic') {
        const modelName = this.model || 'claude-3-5-sonnet-latest';
        const url = this.endpoint || 'https://api.anthropic.com/v1/messages';
        const headers = {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        };
        const body = {
          model: modelName,
          max_tokens: 4000,
          system: systemInstruction,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        };
        const response = await this.makeRequest(url, headers, body);
        rawText = response.content?.[0]?.text || '{}';
      } else if (this.provider === 'OpenRouter') {
        const modelName = this.model || 'google/gemini-2.5-flash';
        const url = this.endpoint || 'https://openrouter.ai/api/v1/chat/completions';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/ridvan-byr/qa-brain',
          'X-Title': 'QA Brain'
        };
        const body = {
          model: modelName,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        };
        const response = await this.makeRequest(url, headers, body);
        rawText = response.choices?.[0]?.message?.content || '{}';
      }

      const parsed = JSON.parse(this.cleanJsonText(rawText));

      return {
        fileName: context.targetFile.filePath,
        framework: context.framework?.adapterName || (context.targetFile.detectedFramework?.toLowerCase() as any) || 'unknown',
        coverageScore: parsed.coverageScore !== undefined ? parsed.coverageScore : 50,
        missingScenarios: parsed.missingScenarios || [],
      };
    } catch (error) {
      console.warn(`${this.provider} API call failed, falling back to deterministic rule test design.`, error);
      return this.generateRuleEngineTestDesign(context);
    }
  }

  /**
   * Generates deterministic findings from local code signals when no LLM is available.
   */
  private generateRuleEngineReview(context: ReviewContext): Omit<ReviewResult, 'score'> {
    const content = context.targetFile.content;
    const findings: Finding[] = [];
    const isSelenium = context.framework?.adapterName === 'selenium' || context.targetFile.detectedFramework === 'Selenium';

    const absoluteXPath = this.findLine(content, /locator\(\s*['"](?:xpath=)?\/\/(?:html|body|\*)/);
    const rawXPath = this.findLine(content, /locator\(\s*['"](?:xpath=)?\/\//);
    const brittleCss = this.findLine(content, /locator\(\s*['"][^'"]*(?:>\s*[^'"]+){2,}|nth-child\(/);
    const hardcodedWait = this.findLine(content, /waitForTimeout\s*\(/);
    const seleniumXPath = this.findLine(content, /driver\.findElement\s*\(\s*By\.xpath\s*\(/);
    const seleniumHardcodedSleep = this.findLine(content, /driver\.sleep\s*\(/);
    const seleniumBuildsDriver = /\bnew\s+Builder\s*\(\s*\).*\.build\s*\(/s.test(content);
    const seleniumMissingQuit = isSelenium && seleniumBuildsDriver && !/\bdriver\.quit\s*\(/.test(content);
    const seleniumSelectorLeak = isSelenium
      && /\b\w+Page\b/.test(content)
      && this.findLine(content, /driver\.findElement\s*\(\s*By\.(?:css|id|xpath|name|className)\s*\(/);
    const sharedState = this.findTopLevelMutableState(content);
    const importsPageObject = /import\s+.*\b\w+Page\b/.test(content);
    const hasAssertions = this.hasAssertionSignal(content);
    const skipMissingAssertion = this.isFrameworkBehaviorContext(context.targetFile.filePath, content);

    if (isSelenium && seleniumSelectorLeak) {
      findings.push({
        title: 'Selector Leak',
        description: 'A Page Object is referenced but a Selenium selector is still used directly in the spec.',
        severity: 'Medium',
        confidence: { level: 95, justification: ['Page Object signal matched', 'Inline Selenium selector matched'] },
        evidence: seleniumSelectorLeak,
        recommendation: 'Move the selector into the Page Object and expose a reusable action method.',
      });
    } else if (isSelenium && seleniumXPath) {
      findings.push({
        title: 'Brittle Selenium XPath Locator',
        description: 'The test uses a Selenium XPath selector directly in the spec, which is tightly coupled to DOM structure.',
        severity: 'High',
        confidence: { level: 95, justification: ['Selenium By.xpath locator matched'] },
        evidence: seleniumXPath,
        recommendation: 'Move locator into a Page Object method and prefer stable, user-facing, or test-owned selectors.',
      });
    } else if (absoluteXPath) {
      findings.push({
        title: 'Brittle XPath Locator with Selector Leak',
        description: 'The test uses an absolute XPath selector directly in the spec, which is brittle and bypasses page object encapsulation.',
        severity: 'High',
        confidence: { level: 98, justification: ['Absolute XPath locator matched', 'Raw selector used in test body'] },
        evidence: absoluteXPath,
        recommendation: 'Encapsulate locator inside LoginPage class and call a method (e.g. await loginPage.login()).',
      });
    } else if (importsPageObject && rawXPath) {
      findings.push({
        title: 'Selector Leak',
        description: 'A Page Object is imported but a raw selector is still used directly in the spec.',
        severity: 'Medium',
        confidence: { level: 98, justification: ['Page Object import matched', 'Raw locator matched'] },
        evidence: rawXPath,
        recommendation: 'Encapsulate the login button selector inside the LoginPage class',
      });
    } else if (rawXPath) {
      findings.push({
        title: 'Brittle XPath Locator',
        description: 'The test uses a raw XPath selector, which is harder to maintain than user-facing Playwright locators.',
        severity: 'High',
        confidence: { level: 95, justification: ['Raw XPath locator matched'] },
        evidence: rawXPath,
        recommendation: 'Replace raw XPath with getByRole, getByLabel, getByText, or a stable test id.',
      });
    }

    if (brittleCss) {
      findings.push({
        title: 'Brittle CSS Selector Chain',
        description: 'The test uses a deep nested CSS selector chain that can break when markup structure changes.',
        severity: 'High',
        confidence: { level: 98, justification: ['Deep CSS nesting or nth-child matched'] },
        evidence: brittleCss,
        recommendation: 'Replace brittle CSS chain with getByRole',
      });
    }

    if (hardcodedWait) {
      findings.push({
        title: 'Redundant Hardcoded Timeout (waitForTimeout)',
        description: 'The test uses a fixed sleep instead of waiting for observable UI or network state.',
        severity: 'High',
        confidence: { level: 95, justification: ['waitForTimeout call matched'] },
        evidence: hardcodedWait,
        recommendation: 'Remove hardcoded wait and rely on Playwright auto-waiting assertions.',
      });
    }

    if (isSelenium && seleniumHardcodedSleep) {
      findings.push({
        title: 'Hardcoded Sleep',
        description: 'The test uses a fixed Selenium sleep instead of waiting for observable browser state.',
        severity: 'High',
        confidence: { level: 95, justification: ['driver.sleep call matched'] },
        evidence: seleniumHardcodedSleep,
        recommendation: 'Replace driver.sleep with an explicit wait for the expected UI state.',
      });
    }

    if (seleniumMissingQuit) {
      findings.push({
        title: 'Resource Cleanup Missing',
        description: 'The test creates a WebDriver session but does not close it with driver.quit().',
        severity: 'High',
        confidence: { level: 95, justification: ['Selenium driver build matched', 'No driver.quit() matched'] },
        evidence: this.findLine(content, /new\s+Builder\s*\(\s*\)/) || 'new Builder().build()',
        recommendation: 'Close the Selenium driver in finally or test teardown with driver.quit().',
      });
    }

    if (sharedState) {
      findings.push({
        title: 'Test Isolation Violation (Shared State)',
        description: 'A mutable variable is defined outside the test body and can leak state between tests.',
        severity: 'Critical',
        confidence: { level: 100, justification: ['Top-level mutable variable matched'] },
        evidence: sharedState,
        recommendation: 'Isolate test state by logging in via isolated custom fixtures',
      });
    }

    if (!hasAssertions && findings.length === 0 && !skipMissingAssertion) {
      findings.push({
        title: 'Missing Assertion',
        description: 'The test performs actions but does not assert the expected outcome.',
        severity: 'Medium',
        confidence: { level: 90, justification: ['No expect(...) assertion matched'] },
        evidence: this.findLine(content, /test\s*\(/) || context.targetFile.filePath,
        recommendation: 'Add an assertion for the expected UI state, navigation, response, or persisted data after the action.',
      });
    }

    if (findings.length > 0) {
      return {
        summary: `Deterministic rule review found ${findings.length} issue(s).`,
        findings,
        strengths: [],
        improvements: findings.map(f => `[ ] ${f.recommendation}`),
        observations: ['Reviewed with local deterministic rules because no LLM response was available.'],
        references: this.mapReferences(findings),
        finalVerdict: 'Needs Improvement',
      };
    }

    return {
      summary: 'Deterministic rule review did not detect issues in this spec.',
      findings,
      strengths: ['POM encapsulation', 'Resilient locators', 'No hardcoded waits'],
      improvements: [],
      observations: skipMissingAssertion
        ? ['Missing assertion check skipped for framework/demo behavior context.']
        : [],
      references: ['locator-review.md', 'waiting-review.md'],
      finalVerdict: 'Excellent',
    };
  }

  private findLine(content: string, pattern: RegExp): string | undefined {
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .find(line => pattern.test(line));
  }

  private findTopLevelMutableState(content: string): string | undefined {
    let braceDepth = 0;
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (braceDepth === 0 && /^let\s+\w+\s*=/.test(trimmed)) {
        return trimmed;
      }
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;
      if (braceDepth < 0) braceDepth = 0;
    }
    return undefined;
  }

  private hasAssertionSignal(content: string): boolean {
    const assertionPatterns = [
      /\bexpect\s*\(/,
      /\bassert\w*\s*\./,
      /\bassert\w*\s*\(/,
      /\bshould\s*\./,
      /\bchai\.expect\s*\(/,
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
      /\beyes\.check\s*\(/,
      /\bpercySnapshot\s*\(/,
      /\.\b(?:validate|verify|assert)\w*\s*\(/,
    ];
    return assertionPatterns.some(pattern => pattern.test(content));
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

  private mapReferences(findings: Finding[]): string[] {
    const refs = new Set<string>();
    for (const finding of findings) {
      const title = finding.title.toLowerCase();
      if (title.includes('locator') || title.includes('selector')) refs.add('locator-review.md');
      if (title.includes('timeout') || title.includes('sleep')) refs.add('waiting-review.md');
      if (title.includes('isolation') || title.includes('shared state')) refs.add('isolation-review.md');
      if (title.includes('assertion')) refs.add('assertion-review.md');
      if (title.includes('cleanup') || title.includes('driver')) refs.add('resource-cleanup-review.md');
    }
    return Array.from(refs);
  }


  private generateRuleEngineTestDesign(context: ReviewContext): TestDesignResult {
    const content = context.targetFile.content;
    const isSelenium = context.framework?.adapterName === 'selenium' || context.targetFile.detectedFramework === 'Selenium';
    const frameworkName = isSelenium ? 'selenium' : 'playwright';
    const missingScenarios: any[] = [];

    const hasLogin = /login|signin|sign-in/i.test(content);
    const hasUsername = /username|email|user/i.test(content);
    const hasPassword = /password|pass/i.test(content);
    const hasEmptyCheck = /empty|blank|required|""|''/i.test(content) && /error|failed|please/i.test(content);
    const hasUnicode = /unicode|special|accent|turkish/i.test(content);
    const hasBoundary = /boundary|limit|max|min|length/i.test(content);

    if (hasLogin && hasUsername && hasPassword && !hasEmptyCheck) {
      missingScenarios.push({
        id: 'TS_001',
        title: 'Empty Password Field Validation',
        category: 'Boundary Value',
        description: 'Verify behavior when password input is left blank.',
        explanation: 'Empty password checks represent the lower boundary of input validation. The current test suite validates valid and invalid credentials but omits verification of mandatory field validation, which is a critical boundary case.',
        criticality: 'HIGH',
        evidence: 'Found credential fields in test file but no check for empty/blank values.',
        suggestedTemplate: {
          playwright: `test('should display validation error on empty password', async ({ page }) => {\n  await page.goto('/login');\n  await page.fill('#username', 'user@test.com');\n  await page.fill('#password', '');\n  await page.click('#log-in');\n  await expect(page.locator('.error')).toHaveText('Password is required');\n});`,
          selenium: `it('should display validation error on empty password', async function() {\n  await driver.get('https://example.com/login');\n  await driver.findElement(By.id('username')).sendKeys('user@test.com');\n  await driver.findElement(By.id('password')).sendKeys('');\n  await driver.findElement(By.id('log-in')).click();\n  const errMsg = await driver.findElement(By.css('.error')).getText();\n  expect(errMsg).to.equal('Password is required');\n});`
        }
      });
    }

    if (hasLogin && !hasUnicode) {
      missingScenarios.push({
        id: 'TS_002',
        title: 'Unicode & Accent Character Credentials',
        category: 'Data Variation',
        description: 'Verify login with usernames/emails containing accented or Turkish characters (e.g. ridvan@örnek.com).',
        explanation: 'Testing with unicode values ensures the application encodes data variations correctly across its login forms. Test suites often verify ASCII strings but miss international characters, which is an equivalence class gap.',
        criticality: 'MEDIUM',
        evidence: 'Detected login test sequence but no unicode character test inputs found.',
        suggestedTemplate: {
          playwright: `test('should handle unicode character email inputs', async ({ page }) => {\n  await page.goto('/login');\n  await page.fill('#username', 'rıdvan@örnek.com');\n  await page.fill('#password', 'Pass123!');\n  await page.click('#log-in');\n  // Add assertion for appropriate error or success behavior\n});`,
          selenium: `it('should handle unicode character email inputs', async function() {\n  await driver.get('https://example.com/login');\n  await driver.findElement(By.id('username')).sendKeys('rıdvan@örnek.com');\n  await driver.findElement(By.id('password')).sendKeys('Pass123!');\n  await driver.findElement(By.id('log-in')).click();\n  // Add assertion\n});`
        }
      });
    }

    if (!hasBoundary && (content.includes('sendKeys') || content.includes('fill'))) {
      missingScenarios.push({
        id: 'TS_003',
        title: 'Input Length Extreme Boundary Validation',
        category: 'Boundary Value',
        description: 'Verify form input handling for maximum length constraints and long string variations.',
        explanation: 'Extreme input lengths test buffer validation boundaries. Neglecting maximum input length tests is a major test design omission, leaving the application open to unhandled input-truncation errors or layout breaking.',
        criticality: 'MEDIUM',
        evidence: 'Form interaction detected but no maximum length constraints are validated in the specs.',
        suggestedTemplate: {
          playwright: `test('should enforce input length limits', async ({ page }) => {\n  await page.goto('/form');\n  const longInput = 'A'.repeat(500);\n  await page.fill('#input-field', longInput);\n  const value = await page.inputValue('#input-field');\n  expect(value.length).toBeLessThanOrEqual(255); // Assumed limit\n});`,
          selenium: `it('should enforce input length limits', async function() {\n  await driver.get('https://example.com/form');\n  const longInput = 'A'.repeat(500);\n  await driver.findElement(By.id('input-field')).sendKeys(longInput);\n  const value = await driver.findElement(By.id('input-field')).getAttribute('value');\n  expect(value.length).to.be.at.most(255); // Assumed limit\n});`
        }
      });
    }

    let coverageScore = 100;
    if (missingScenarios.length > 0) {
      coverageScore = Math.max(30, 100 - (missingScenarios.length * 20));
    }

    return {
      fileName: context.targetFile.filePath,
      framework: frameworkName,
      coverageScore,
      missingScenarios
    };
  }
}
