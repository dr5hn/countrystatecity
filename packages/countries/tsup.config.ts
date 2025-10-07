import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/index.ts', 'src/loaders.ts', 'src/utils.ts', 'src/types.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  // Don't bundle - output as separate module
  bundle: false,
  // Copy data files to dist directory
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
    console.log('✓ Data files copied to dist/data');
  },
});
