import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '@environment': mode === 'production'
          ? path.resolve(__dirname, './src/environments/environment.prod.js')
          : path.resolve(__dirname, './src/environments/environment.js'),
      },
    },
    optimizeDeps: {
      exclude: ['@ionic/core'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
        external: ['/ionic.esm.js'],
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/@ionic/core/dist/ionic/*',
            dest: '',
          },
        ],
      }),
    ],
  };
});