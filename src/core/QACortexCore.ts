import { ReviewPipeline } from './ReviewPipeline';
import { GeminiProvider } from '../reviewer/GeminiProvider';
import * as fs from 'fs';
import * as path from 'path';

export class QACortexCore {
  /**
   * Main static runner to execute QA Cortex review over a target file.
   */
  public static async runReview(targetFilePath: string): Promise<void> {
    try {
      console.log(`=== Starting QA Cortex Review: ${targetFilePath} ===`);
      
      const provider = new GeminiProvider();
      const pipeline = new ReviewPipeline('.', provider);
      
      const { report, result } = await pipeline.runPipeline(targetFilePath);
      
      // Save report in reviews/ folder
      const reviewsDir = path.resolve('.', 'reviews');
      if (!fs.existsSync(reviewsDir)) {
        fs.mkdirSync(reviewsDir);
      }

      const fileName = path.basename(targetFilePath, path.extname(targetFilePath));
      const reportPath = path.resolve(reviewsDir, `${fileName}-review.md`);
      
      fs.writeFileSync(reportPath, report, 'utf8');
      
      console.log(`\n==========================================`);
      console.log(`Review Completed Successfully!`);
      console.log(`Final Verdict: ${result.finalVerdict}`);
      console.log(`Report Saved To: ${reportPath}`);
      console.log(`==========================================`);
    } catch (error) {
      console.error('QA Cortex Execution Error:', error);
      process.exit(1);
    }
  }
}

// Execute CLI wrapper if file invoked directly
const args = process.argv.slice(2);
if (args.length > 0) {
  const target = args[0];
  QACortexCore.runReview(target);
}
