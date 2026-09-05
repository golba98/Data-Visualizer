import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const COPY_AS_IS = ['lib', 'src', 'data', 'assets'];

// Copies script folders into the build
function copyStaticDirectories() {
  return {
    name: 'copy-static-directories',
    apply: 'build',
    async closeBundle() {
      const root = process.cwd();
      for (const dir of COPY_AS_IS) {
        await cp(resolve(root, dir), resolve(root, 'dist', dir), {
          recursive: true,
          force: true
        });
      }
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [copyStaticDirectories()]
});
