import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Build configuration
  build: {
    outDir: 'build',
    assetsDir: 'public',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          jsonforms: [
            '@jsonforms/core',
            '@jsonforms/react',
            '@jsonforms/material-renderers',
          ],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
      // Suppress dynamic import warnings (same as config-overrides.js)
      onwarn(warning, warn) {
        if (
          warning.code === 'EVAL' ||
          (warning.message && warning.message.includes('ExtensionsLoader'))
        ) {
          return;
        }
        warn(warning);
      },
    },
  },

  // Dev server configuration
  server: {
    port: 3000,
    open: true,
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Define global constants (for environment variables)
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development',
    ),
  },
});
