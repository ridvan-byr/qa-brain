#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ReviewPipeline } from "./core/ReviewPipeline.js";
import { BenchmarkRunner } from "./evaluation/BenchmarkRunner.js";
import { GeminiProvider } from "./reviewer/GeminiProvider.js";
import { Scanner } from "./core/Scanner.js";
import { TestDesignEngine } from "./design/TestDesignEngine.js";
import * as fs from 'fs';
import * as path from 'path';

// Load app version from package.json dynamically
let appVersion = "0.1.0";
try {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    appVersion = packageJson.version || "0.1.0";
  }
} catch (err) {
  // Fail silently, fallback to default version
}

function findNearestProjectRoot(startPath: string): string {
  let currentDir = fs.statSync(startPath).isDirectory() ? startPath : path.dirname(startPath);
  while (true) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  return fs.statSync(startPath).isDirectory() ? startPath : path.dirname(startPath);
}

const server = new Server({
  name: "qa-brain-mcp",
  version: appVersion
}, {
  capabilities: {
    tools: {}
  }
});

// Register tools with rich descriptions for AI agents
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "review_file",
        description: "Runs a repository-aware AI review on a single Playwright or Selenium test file. Validates locator resilience, Page Object Model (POM) encapsulation, wait strategy usage, test isolation, and driver cleanup. Returns a detailed JSON report including evidence, severity, and recommendations.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Absolute path to the spec/test file (e.g. C:/project/tests/login.spec.ts)"
            }
          },
          required: ["filePath"]
        }
      },
      {
        name: "review_repository",
        description: "Scans a test directory recursively for Playwright or Selenium tests, runs reviews, and outputs a Quality/Risk repository summary. Automatically ignores node_modules/dist/.git and matches optional ignore patterns.",
        inputSchema: {
          type: "object",
          properties: {
            dirPath: {
              type: "string",
              description: "Absolute path to the test directory to scan recursively"
            },
            maxFiles: {
              type: "number",
              description: "Maximum number of spec files to analyze in this run to optimize execution time (default: 30)"
            },
            ignorePatterns: {
              type: "array",
              items: { type: "string" },
              description: "List of glob patterns to exclude from analysis (e.g. ['**/generated/**', '**/fixtures/**'])"
            }
          },
          required: ["dirPath"]
        }
      },
      {
        name: "generate_test_design",
        description: "Analyzes an active test file to detect missing scenarios (applying BVA, ECP, and security rules), explains the QA rationale for each, and generates suggested code templates for Playwright and Selenium.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Absolute path to the test file to design scenarios for (e.g. C:/project/tests/login.spec.ts)"
            }
          },
          required: ["filePath"]
        }
      },
      {
        name: "run_benchmark",
        description: "Runs the built-in QA Brain calibration suite against local ground truth specs. Verifies engine accuracy by calculating Precision, Recall, and checking for regressions.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// Call tools implementation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const provider = new GeminiProvider(); // Uses standard process.env.GEMINI_API_KEY if present

  try {
    switch (name) {
      case "review_file": {
        const rawPath = args?.filePath as string;
        if (!rawPath) {
          throw new Error("Missing required parameter: filePath");
        }

        const filePath = path.resolve(rawPath);
        if (!fs.existsSync(filePath)) {
          throw new Error(`File does not exist: ${filePath}`);
        }

        const fileName = path.basename(filePath);
        if (!Scanner.isTestFile(fileName)) {
          throw new Error(`File must be a valid test file name: ${filePath}`);
        }
        if (Scanner.isPythonTestFile(fileName)) {
          throw new Error("Python discovery is enabled, but Python review is not enabled yet.");
        }
        
        const projectRoot = findNearestProjectRoot(filePath);
        const pipeline = new ReviewPipeline(projectRoot, provider);
        const { result } = await pipeline.runPipeline(filePath);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "generate_test_design": {
        const rawPath = args?.filePath as string;
        if (!rawPath) {
          throw new Error("Missing required parameter: filePath");
        }

        const filePath = path.resolve(rawPath);
        if (!fs.existsSync(filePath)) {
          throw new Error(`File does not exist: ${filePath}`);
        }

        const fileName = path.basename(filePath);
        if (!Scanner.isTestFile(fileName)) {
          throw new Error(`File must be a valid test file name: ${filePath}`);
        }
        if (Scanner.isPythonTestFile(fileName)) {
          throw new Error("Python discovery is enabled, but Python test design is not enabled yet.");
        }

        const projectRoot = findNearestProjectRoot(filePath);
        const engine = new TestDesignEngine(projectRoot, provider);
        const designResult = await engine.designTests(filePath);
        return {
          content: [{ type: "text", text: JSON.stringify(designResult, null, 2) }]
        };
      }
      
      case "review_repository": {
        const rawDir = args?.dirPath as string;
        if (!rawDir) {
          throw new Error("Missing required parameter: dirPath");
        }

        const dirPath = path.resolve(rawDir);
        if (!fs.existsSync(dirPath)) {
          throw new Error(`Directory does not exist: ${dirPath}`);
        }

        const stat = fs.statSync(dirPath);
        if (!stat.isDirectory()) {
          throw new Error(`Path is not a directory: ${dirPath}`);
        }

        const maxFiles = (args?.maxFiles as number) || 30;
        const ignorePatterns = (args?.ignorePatterns as string[]) || [];

        const files = Scanner.scanDirectory(dirPath, ignorePatterns)
          .filter(file => Scanner.isReviewableTestFile(path.basename(file)));

        if (files.length === 0) {
          return {
            content: [{ type: "text", text: JSON.stringify({ filesReviewed: 0, message: "No .spec.ts or .test.ts files found in directory." }, null, 2) }]
          };
        }

        const projectRoot = findNearestProjectRoot(dirPath);
        const pipeline = new ReviewPipeline(projectRoot, provider);
        const summary = await Scanner.runScan(files, pipeline, { maxFiles, ignorePatterns });

        return {
          content: [{ type: "text", text: JSON.stringify(summary, null, 2) }]
        };
      }

      case "run_benchmark": {
        const results = await BenchmarkRunner.runAll();
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error executing tool ${name}: ${error.message}` }]
    };
  }
});

// Start MCP Sunucusu
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("QA Brain MCP Server running on stdio");
}

main().catch((error) => {
  console.error("MCP Server failed to start:", error);
  process.exit(1);
});
