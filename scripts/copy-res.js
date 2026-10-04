import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcResDir = path.join(rootDir, 'res');
const publicResDir = path.join(rootDir, 'public', 'res');
const distResDir = path.join(rootDir, 'dist', 'res');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-res] Source directory does not exist: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[copy-res] Syncing root res/ assets to public/res/ ...');
copyRecursive(srcResDir, publicResDir);

if (process.argv.includes('--dist') || fs.existsSync(path.join(rootDir, 'dist'))) {
  console.log('[copy-res] Syncing root res/ assets to dist/res/ ...');
  copyRecursive(srcResDir, distResDir);
}

console.log('[copy-res] Assets successfully copied.');
