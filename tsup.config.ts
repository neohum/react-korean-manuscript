import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: false,
  minify: false,
  external: ['react', 'react-dom'],
  injectStyle: true,
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
