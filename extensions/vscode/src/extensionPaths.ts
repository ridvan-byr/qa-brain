import * as fs from 'fs';
import * as path from 'path';

export function resolveQaCortexRoot(): string {
  const extensionRoot = path.resolve(__dirname, '../..');
  const packagedRoot = path.join(extensionRoot, 'qa-cortex-core');

  if (fs.existsSync(path.join(packagedRoot, 'dist', 'src'))) {
    return packagedRoot;
  }

  return path.resolve(__dirname, '../../../..');
}
