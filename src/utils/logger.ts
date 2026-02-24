/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * Logger utility for development debugging
 *
 * Logs are only output in development mode (NODE_ENV !== 'production').
 * In production builds, these calls are stripped by the bundler.
 */

const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) {
      console.log('[ui-toolkit]', ...args)
    }
  },

  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn('[ui-toolkit]', ...args)
    }
  },

  error: (...args: unknown[]): void => {
    if (isDev) {
      console.error('[ui-toolkit]', ...args)
    }
  },

  debug: (...args: unknown[]): void => {
    if (isDev) {
      console.debug('[ui-toolkit]', ...args)
    }
  }
}
