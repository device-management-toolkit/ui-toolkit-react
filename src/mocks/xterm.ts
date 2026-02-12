/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

// Mock for @xterm/xterm

export class Terminal {
  private _options: TerminalOptions

  constructor(options?: TerminalOptions) {
    this._options = options || {}
  }

  open = jest.fn()
  write = jest.fn()
  reset = jest.fn()
  dispose = jest.fn()
  onData = jest.fn()
  onKey = jest.fn()
  hasSelection = jest.fn().mockReturnValue(false)
  getSelection = jest.fn().mockReturnValue('')
  attachCustomKeyEventHandler = jest.fn()
  focus = jest.fn()
  blur = jest.fn()
  clear = jest.fn()
  scrollToBottom = jest.fn()
}

export interface TerminalOptions {
  cursorStyle?: 'block' | 'underline' | 'bar'
  fontWeight?: string
  rows?: number
  cols?: number
}
