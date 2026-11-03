import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['zone.js']
  },
  ssr: {
    noExternal: ['zone.js']
  }
});