import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
return {
    plugins: [react(), tailwindcss()],
build: {
      rollupOptions: {
        input: {
          app: path.resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/app.js',
          assetFileNames: 'assets/[name][extname]',
          chunkFileNames: 'assets/[name].js',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false,
      watch: null,
    },
  };
});
