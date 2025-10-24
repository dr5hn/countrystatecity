import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export default defineConfig([
  // ESM and CJS builds for npm consumption
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,  // Enable code splitting for better tree-shaking
    treeshake: true,
    bundle: true,
    // Copy data files to dist directory after build
    onSuccess: async () => {
      // Copy data directory to dist
      const copyDir = (src: string, dest: string) => {
        mkdirSync(dest, { recursive: true });
        const entries = readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = join(src, entry.name);
          const destPath = join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            copyFileSync(srcPath, destPath);
          }
        }
      };
      
      copyDir('src/data', 'dist/data');
      console.log('✓ Browser-optimized data files copied to dist/data');
    },
  },
  // IIFE build for CDN usage
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'CountryStateCityBrowser',
    outDir: 'dist/cdn',
    minify: true,
    sourcemap: true,
    platform: 'browser',
  },
]);
