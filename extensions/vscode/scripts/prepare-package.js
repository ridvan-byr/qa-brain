const fs = require('fs');
const path = require('path');

const extensionRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(extensionRoot, '../..');
const packageRoot = path.join(extensionRoot, 'qa-brain-core');

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Required package asset not found: ${source}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, {
    recursive: true,
    filter: (item) => !item.endsWith('.ts') && !item.endsWith('.map'),
  });
}

fs.rmSync(packageRoot, { recursive: true, force: true });
fs.mkdirSync(packageRoot, { recursive: true });

copyDirectory(path.join(repoRoot, 'dist'), path.join(packageRoot, 'dist'));
copyDirectory(path.join(repoRoot, 'knowledge'), path.join(packageRoot, 'knowledge'));

fs.copyFileSync(path.join(repoRoot, 'LICENSE'), path.join(packageRoot, 'LICENSE'));

console.log(`QA Brain package assets prepared at ${packageRoot}`);
