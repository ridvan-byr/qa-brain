import * as vscode from 'vscode';

export class VsCodeLanguageModelProvider {
  constructor(private readonly geminiFallback: any) {}

  public async review(context: any, ruleContents: string[]): Promise<any> {
    let selectedModelId = 'unknown';
    try {
      const model = await this.selectModel();
      if (!model) {
        throw new Error("No active Language Model (LLM) provider (like Gemini, Claude, or Copilot) was found in your IDE.");
      }

      selectedModelId = model.id;
      console.log(`QA Brain: Running LLM review using VS Code Language Model: ${model.id}`);

      const systemInstruction = 'You are QA Brain Reviewer. Match findings and output JSON matching response-format.md schema.';
      const userPrompt = `
Review Context:
${JSON.stringify(context, null, 2)}

Rule Sets Loaded:
${ruleContents.join('\n\n')}

Target Code to Review:
${context.targetFile.content}
`;

      const messages = [
        vscode.LanguageModelChatMessage.User(systemInstruction),
        vscode.LanguageModelChatMessage.User(userPrompt)
      ];

      const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

      let rawText = '';
      for await (const fragment of response.text) {
        rawText += fragment;
      }

      const parsed = JSON.parse(rawText);
      const observations = parsed.observations || [];
      observations.push(`Reviewed using VS Code Language Model: ${selectedModelId}`);

      return {
        summary: parsed.summary || 'No summary provided.',
        findings: parsed.findings || [],
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        observations: observations,
        references: parsed.references || [],
        finalVerdict: parsed.finalVerdict || 'Needs Improvement',
      };
    } catch (err: any) {
      console.warn("VS Code Language Model review failed, falling back to local deterministic rules:", err);
      vscode.window.showWarningMessage(`QA Brain: Falling back to local rules. (Reason: ${err.message || err})`);
      
      const result = await this.geminiFallback.review(context, ruleContents);
      result.observations = [
        ...(result.observations || []),
        `VS Code Language Model fell back to local rules. (Reason: ${err.message || err})`
      ];
      return result;
    }
  }

  public async designTests(context: any, ruleContents: string[]): Promise<any> {
    let selectedModelId = 'unknown';
    try {
      const model = await this.selectModel();
      if (!model) {
        throw new Error("No active Language Model (LLM) provider (like Gemini, Claude, or Copilot) was found in your IDE.");
      }

      selectedModelId = model.id;
      console.log(`QA Brain: Running LLM test design using VS Code Language Model: ${model.id}`);

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

      const messages = [
        vscode.LanguageModelChatMessage.User(systemInstruction),
        vscode.LanguageModelChatMessage.User(userPrompt)
      ];

      const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

      let rawText = '';
      for await (const fragment of response.text) {
        rawText += fragment;
      }

      const parsed = JSON.parse(rawText);
      return {
        fileName: context.targetFile.filePath,
        framework: context.framework?.adapterName || (context.targetFile.detectedFramework?.toLowerCase() as any) || 'unknown',
        coverageScore: parsed.coverageScore !== undefined ? parsed.coverageScore : 50,
        missingScenarios: parsed.missingScenarios || [],
      };
    } catch (err: any) {
      console.warn("VS Code Language Model test design failed, falling back to local deterministic rules:", err);
      vscode.window.showWarningMessage(`QA Brain: Falling back to local rules for Test Design. (Reason: ${err.message || err})`);
      return this.geminiFallback.designTests(context, ruleContents);
    }
  }

  private async selectModel(): Promise<vscode.LanguageModelChat | undefined> {
    // Attempt to select copilot or gemini models, fallback to first available
    let [model] = await vscode.lm.selectChatModels({ family: 'gpt-4o' });
    if (!model) {
      [model] = await vscode.lm.selectChatModels({ family: 'gemini-1.5-pro' });
    }
    if (!model) {
      const allModels = await vscode.lm.selectChatModels();
      if (allModels.length > 0) {
        model = allModels[0];
      }
    }
    return model;
  }
}
