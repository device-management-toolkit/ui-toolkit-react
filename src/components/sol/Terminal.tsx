/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * Terminal Component
 *
 * Wrapper component for xterm.js that handles:
 * - Mounting the terminal to the DOM
 * - Keyboard input (including Ctrl+C, Ctrl+V, Backspace)
 * - Copy/paste functionality
 *
 * This component receives an xterm instance from the parent Sol component
 * and attaches it to a div element.
 */

import React, { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'

// Default styles for the outer container
const DEFAULT_CONTAINER_STYLES: React.CSSProperties = {
  display: 'block',
  textAlign: 'center'
}

// Default styles for the xterm element
const DEFAULT_XTERM_STYLES: React.CSSProperties = {
  display: 'inline-block',
  width: 'fit-content',
  textAlign: 'left'
}

// Props for the Terminal component
export interface IPropTerminal {
  handleKeyPress: (data: string) => void // Callback to send keystrokes to AMT device
  xterm: Terminal // xterm.js instance from parent
  containerClassName?: string // Custom CSS class for outer container
  containerStyle?: React.CSSProperties // Custom inline styles for outer container
  xtermClassName?: string // Custom CSS class for xterm element
  xtermStyle?: React.CSSProperties // Custom inline styles for xterm element
}

export const Term: React.FC<IPropTerminal> = ({
  handleKeyPress,
  xterm,
  containerClassName,
  containerStyle,
  xtermClassName,
  xtermStyle
}) => {
  // Ref to the DOM element where xterm will be mounted
  const terminalRef = useRef<HTMLDivElement>(null)
  // Flag to prevent re-opening the terminal
  const openedRef = useRef<boolean>(false)
  // Ref to always have the latest handleKeyPress callback
  const handleKeyPressRef = useRef(handleKeyPress)

  // Keep the ref updated with latest handleKeyPress
  useEffect(() => {
    handleKeyPressRef.current = handleKeyPress
  }, [handleKeyPress])

  // Initialize xterm when component mounts.
  // Sets up keyboard handlers for special keys (Ctrl+C, Ctrl+V, Backspace).
  useEffect(() => {
    const element = terminalRef.current
    if (element === null || xterm === null || openedRef.current) {
      return
    }

    openedRef.current = true
    xterm.open(element) // Mount xterm to the DOM element
    xterm.clear()
    xterm.reset()
    xterm.focus()

    // Set up keyboard event handler
    xterm.onKey(({ key, domEvent }) => {
      domEvent.preventDefault()

      // Handle Ctrl+C: copy selection or send interrupt signal
      if (domEvent.ctrlKey && domEvent.key === 'c') {
        if (xterm.hasSelection()) {
          // Copy selected text to clipboard
          navigator.clipboard.writeText(xterm.getSelection()).catch((err) => {
            console.error('Failed to copy to clipboard', err)
          })
        } else {
          // Send interrupt signal (Ctrl+C = 0x03)
          handleKeyPressRef.current('\x03')
        }
        return
      }

      // Handle Ctrl+V: paste from clipboard
      if (domEvent.ctrlKey && domEvent.key === 'v') {
        navigator.clipboard
          .readText()
          .then((text) => {
            handleKeyPressRef.current(text)
          })
          .catch((err) => {
            console.error('Failed to read clipboard', err)
          })
        return
      }

      // Handle Backspace: send destructive backspace sequence
      // Otherwise send the key as-is
      const keyToSend = domEvent.key === 'Backspace' ? '\b \b' : key
      handleKeyPressRef.current(keyToSend)
    })
  }, [xterm])

  return (
    <div
      className={containerClassName}
      style={{ ...DEFAULT_CONTAINER_STYLES, ...containerStyle }}
    >
      {/* Div where xterm.js will render the terminal */}
      <div
        ref={terminalRef}
        className={xtermClassName}
        style={{ ...DEFAULT_XTERM_STYLES, ...xtermStyle }}
      />
    </div>
  )
}

export default Term
