import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@device-management-toolkit/ui-toolkit-react': path.resolve(
        __dirname,
        '../src/index.ts'
      ),
      '@device-management-toolkit/ui-toolkit/core': path.resolve(
        __dirname,
        'node_modules/@device-management-toolkit/ui-toolkit/bundles/core.bundle.js'
      ),
      '@xterm/xterm': path.resolve(
        __dirname,
        'node_modules/@xterm/xterm/lib/xterm.js'
      ),
      // Dedupe React to prevent multiple instances
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-i18next': path.resolve(__dirname, 'node_modules/react-i18next'),
      i18next: path.resolve(__dirname, 'node_modules/i18next')
    }
  }
})
