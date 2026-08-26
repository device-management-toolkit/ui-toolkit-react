/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { coverageConfigDefaults, defineConfig } from 'vitest/config'

const isCI = !!process.env.CI

const resolveSrc = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@device-management-toolkit\/ui-toolkit\/core$/,
        replacement: resolveSrc('./src/mocks/ui-toolkit-core.ts')
      },
      {
        find: /^@xterm\/xterm$/,
        replacement: resolveSrc('./src/mocks/xterm.ts')
      },
      {
        find: /^react-i18next$/,
        replacement: resolveSrc('./src/mocks/react-i18next.ts')
      }
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    root: resolveSrc('./'),
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    reporters: isCI ? ['default', 'junit', 'github-actions'] : ['default'],
    outputFile: {
      junit: 'junit.xml'
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov', 'clover', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/**/*.d.ts',
        'src/index.ts',
        'src/**/mocks/**'
      ],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60
      }
    }
  }
})
