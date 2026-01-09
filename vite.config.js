import handlebars from 'vite-plugin-handlebars';
import customhbs from './src/app/config/vite-plugin-handlebars-precompile';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'src/app/'),
  publicDir: path.resolve(__dirname, 'static'),
  build: {
    outDir: path.resolve(__dirname, '.dist'),
  },
  resolve:{
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared/'),
      '@pages': path.resolve(__dirname, 'src/pages/'),
      '@entities': path.resolve(__dirname, 'src/entities/'),
      '@features': path.resolve(__dirname, 'src/features/'),
      '@widgets': path.resolve(__dirname, 'src/widgets/'),
      '@styles': path.resolve(__dirname, 'src/shared/assets/styles/')
    },
  },
  css: {
  preprocessorOptions: {
    scss: {
    loadPaths: [
      path.resolve(__dirname, 'src/shared/assets/styles')  
    ]   
    }
  }
  },
  
  
  
  plugins: [
    handlebars({
      partialDirectory: [path.resolve(__dirname, 'src/shared/ui/'), path.resolve(__dirname, 'src/pages/**/**')]
    }), customhbs() 
],

 
});