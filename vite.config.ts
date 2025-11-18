import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const base = mode === 'production' ? '/lingo-mingle/' : '/';

    // HTTPS configuration for local development (allows MediaDevices API on mobile)
    const httpsConfig = mode === 'development' && fs.existsSync('.cert/localhost-key.pem')
      ? {
          key: fs.readFileSync('.cert/localhost-key.pem'),
          cert: fs.readFileSync('.cert/localhost-cert.pem'),
        }
      : undefined;

    return {
      // Use a relative base in production so GitHub Pages can serve from a subfolder
      base,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        // Disable HTTPS for ngrok - ngrok adds HTTPS on top of HTTP
        // https: httpsConfig,
        allowedHosts: ['.ngrok-free.dev'],
      }
    };
});
