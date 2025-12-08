import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Cast process to any to avoid TS error if node types are missing
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Robustly polyfill process.env for client-side usage
      'process.env': JSON.stringify(env)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true
    }
  };
});