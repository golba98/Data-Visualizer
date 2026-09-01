import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// index.html loads p5 and every source file with classic <script src> tags, not ES
// modules, so Vite never pulls them into its build graph. Without this the build
// emits an index.html pointing at files that were never copied into dist/.
const COPY_AS_IS = ['lib', 'src', 'data', 'assets'];

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
