import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const base = mode === 'production' ? './' : '/';
    return {
      // Use a relative base in production so GitHub Pages can serve from a subfolder
      base,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
