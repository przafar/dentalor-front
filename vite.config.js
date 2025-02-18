import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  define: {
    'process.env': process.env,
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/element-variables.scss";`,
      },
    },
  },
  optimizeDeps: {
    include: ['@tailwindConfig'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api/': {
        target: 'https://med.mf.uz/api/web/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
