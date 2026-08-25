/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { vi } from 'vitest'

// Mock for @xterm/xterm

export class Terminal {
  private _options: TerminalOptions

  constructor(options?: TerminalOptions) {
    this._options = options || {}
  }

  open = vi.fn()
  write = vi.fn()
  reset = vi.fn()
  dispose = vi.fn()
  onData = vi.fn()
  onKey = vi.fn()
  hasSelection = vi.fn().mockReturnValue(false)
  getSelection = vi.fn().mockReturnValue('')
  attachCustomKeyEventHandler = vi.fn()
  focus = vi.fn()
  blur = vi.fn()
  clear = vi.fn()
  scrollToBottom = vi.fn()
}

export interface TerminalOptions {
  cursorStyle?: 'block' | 'underline' | 'bar'
  fontWeight?: string
  rows?: number
  cols?: number
}
