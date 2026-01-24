import handlebars from 'vite-plugin-handlebars';
import customhbs from './src/app/config/vite-plugin-handlebars-precompile.js';
import path from 'path';
import tsconfig from './tsconfig.json';
import { defineConfig } from 'vite';

function resolveAliasesFromTsconfig() {
  const paths = tsconfig.compilerOptions.paths;

  return Object.entries(paths).map(([alias, [target]]) => {
    const find = alias.replace('/*', '');
    const replacement = path.resolve(__dirname, target!.replace('/*', ''));

    return { find, replacement };
  });
}

export default defineConfig({
  root: path.resolve(__dirname, 'src/app/'),
  publicDir: path.resolve(__dirname, 'static'),
  build: {
    outDir: path.resolve(__dirname, '.dist'),
  },
  resolve: {
    alias: resolveAliasesFromTsconfig(),
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'src/shared/assets/styles')],
      },
    },
  },

  plugins: [
    handlebars({
      partialDirectory: [
        path.resolve(__dirname, 'src/shared/ui/'),
        path.resolve(__dirname, 'src/pages/**/**'),
      ],
    }),
    customhbs(),
  ],
});
