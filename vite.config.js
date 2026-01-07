import handlebars from 'vite-plugin-handlebars';
import customhbs from './src/app/config/vite-plugin-handlebars-precompile';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'src/app/'),
  publicDir: path.resolve(__dirname, 'static'),
  
  resolve:{
    alias:{
      '@shared': path.resolve(__dirname, 'src/shared/'),
      '@pages': path.resolve(__dirname, 'src/pages/')
    },
  },
  
  plugins: [
    handlebars({
      partialDirectory: (path.resolve(__dirname, 'src/shared/ui/'))
    }), customhbs() 
],
});