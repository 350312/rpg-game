import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function resAssetPlugin(): Plugin {
  return {
    name: 'res-asset-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/res/')) {
          const filePath = path.resolve(process.cwd(), req.url.slice(1).split('?')[0]);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.wav': 'audio/wav',
              '.ttf': 'font/ttf',
              '.txt': 'text/plain',
            };
            if (mimeTypes[ext]) {
              res.setHeader('Content-Type', mimeTypes[ext]);
            }
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
    closeBundle() {
      // Ensure root res/ is copied into dist/res for production hosting (Vercel, Netlify, etc.)
      const rootRes = path.resolve(process.cwd(), 'res');
      const distRes = path.resolve(process.cwd(), 'dist', 'res');
      if (fs.existsSync(rootRes)) {
        copyDirRecursive(rootRes, distRes);
        console.log('[resAssetPlugin] Verified dist/res assets copied successfully.');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), resAssetPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
