const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const configPath = path.resolve(__dirname, 'repositories.json');
if (!fs.existsSync(configPath)) {
  console.error(`Config file not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const targetDir = 'C:/tmp/qa-cortex-validation-repos';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log(`Cloning validation repositories into ${targetDir}...`);

for (const repo of config.repositories) {
  if (!repo.url) {
    console.log(`[Skip] ${repo.name} has no URL.`);
    continue;
  }

  // Resolve local directory path
  // Since some local paths might be nested (e.g. C:/tmp/qa-cortex-validation-repos/playwright-mcp),
  // we find the target directory for cloning
  const repoName = repo.url.split('/').pop().replace('.git', '');
  const clonePath = path.join(targetDir, repoName);

  if (fs.existsSync(clonePath)) {
    console.log(`[Exists] ${repo.name} already cloned at ${clonePath}`);
    continue;
  }

  console.log(`[Cloning] ${repo.name} (${repo.url}) to ${clonePath}...`);
  try {
    execSync(`git clone ${repo.url} "${clonePath}" --depth 1`, { stdio: 'inherit' });
    console.log(`✓ Successfully cloned ${repo.name}`);
  } catch (error) {
    console.error(`✗ Failed to clone ${repo.name}:`, error.message);
  }
}

console.log('\nAll repositories cloned. You can now run the validation suite.');
