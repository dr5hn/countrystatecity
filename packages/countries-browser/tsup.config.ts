import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

export default defineConfig([
  // NPM bundle (ESM + CJS)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,  // Enable code splitting for tree-shaking
    treeshake: true,
    // Bundle the TypeScript code but keep data external
    bundle: true,
    // Mark data paths as external so they're not bundled
    esbuildOptions(options) {
      options.external = ['./data/*'];
    },
    // Copy data files to dist directory
    onSuccess: async () => {
      // Copy data directory to dist (if it exists)
      if (existsSync('src/data')) {
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
        console.log('✓ Data files copied to dist/data');
      } else {
        console.log('⚠ No data directory found. Run `pnpm generate-data` first.');
      }
    },
  },
  // CDN bundle (IIFE for script tag usage)
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'CountryStateCityBrowser',
    outDir: 'dist/cdn',
    minify: true,
    sourcemap: true,
    clean: false, // Don't clean the whole dist directory
  },
]);
