import * as fs from 'fs';
import * as path from 'path';

export class AIInstructionExporter {
  public static exportRules(targetProjectDir: string, framework = 'playwright'): void {
    const resolvedTargetDir = path.resolve(targetProjectDir);
    if (!fs.existsSync(resolvedTargetDir)) {
      throw new Error(`Target project directory does not exist: ${targetProjectDir}`);
    }

    // Resolve package root directory robustly in both TS/dev and compiled JS modes
    let rootDir = path.resolve(__dirname, '../../..');
    if (!fs.existsSync(path.join(rootDir, 'knowledge'))) {
      rootDir = path.resolve(__dirname, '../..');
    }

    const knowledgeBaseDir = path.resolve(rootDir, 'knowledge', framework);
    if (!fs.existsSync(knowledgeBaseDir)) {
      throw new Error(`Knowledge base for framework "${framework}" not found at ${knowledgeBaseDir}`);
    }

    console.log(`Reading QA Cortex knowledge base from ${knowledgeBaseDir}...`);
    const rulesContent = this.gatherRules(knowledgeBaseDir);

    if (!rulesContent) {
      throw new Error(`No rules content found in ${knowledgeBaseDir}`);
    }

    // 1. Write .cursorrules
    const cursorRulesPath = path.join(resolvedTargetDir, '.cursorrules');
    const cursorRulesContent = `# Playwright Test Automation Rules & Standards

You are an expert QA Automation Engineer. When writing or editing Playwright tests in this repository, you MUST strictly adhere to these standards:

${rulesContent}`;
    fs.writeFileSync(cursorRulesPath, cursorRulesContent, 'utf8');
    console.log(`✓ Generated: ${cursorRulesPath}`);

    // 2. Write .agents/AGENTS.md
    const agentsDir = path.join(resolvedTargetDir, '.agents');
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
    }
    const agentsRulesPath = path.join(agentsDir, 'AGENTS.md');
    const agentsRulesContent = `# QA Cortex Agent Standards

You are pair programming on a Playwright test automation codebase. You MUST strictly adhere to the following project-scoped standards for all code generation, reviews, and modifications:

${rulesContent}`;
    fs.writeFileSync(agentsRulesPath, agentsRulesContent, 'utf8');
    console.log(`✓ Generated: ${agentsRulesPath}`);

    // 3. Write .github/copilot-instructions.md
    const githubDir = path.join(resolvedTargetDir, '.github');
    if (!fs.existsSync(githubDir)) {
      fs.mkdirSync(githubDir, { recursive: true });
    }
    const copilotRulesPath = path.join(githubDir, 'copilot-instructions.md');
    const copilotRulesContent = `# Playwright Test Quality Instructions

When suggesting code completions, generating new tests, or refactoring existing specs in this repository, you MUST follow these standards:

${rulesContent}`;
    fs.writeFileSync(copilotRulesPath, copilotRulesContent, 'utf8');
    console.log(`✓ Generated: ${copilotRulesPath}`);
  }

  private static gatherRules(dir: string): string {
    let content = '';
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        content += this.gatherRules(fullPath);
      } else if (stat.isFile() && file.endsWith('.md') && file !== 'README.md') {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        // Extract title or make a clean section header
        const relativeName = path.basename(file, '.md');
        const formattedTitle = relativeName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        content += `\n## ${formattedTitle} Standards\n\n${fileContent}\n`;
      }
    }
    return content;
  }
}
