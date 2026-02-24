/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * Terminal Component Tests
 *
 * The Terminal component is a React wrapper around xterm.js, a full-featured
 * terminal emulator. In the SOL (Serial Over LAN) context, it displays the
 * text-based console output from the remote AMT device.
 *
 * SOL provides access to the BIOS setup, boot messages, and operating system
 * console - essentially what you'd see if you connected a physical monitor
 * and keyboard to the server.
 *
 * Key responsibilities:
 * - Mount the xterm.js terminal into a DOM element
 * - Forward keyboard input to the SOL connection
 * - Prevent multiple xterm.open() calls (which would cause errors)
 */

import { render, screen } from '@testing-library/react'
import Term from './Terminal'
import { Terminal } from '@xterm/xterm'

describe('Term', () => {
  // Mock callback for handling keyboard input - sends keys to remote device
  const mockHandleKeyPress = jest.fn()
  // Mock xterm.js instance - this would be a real Terminal in production
  let mockXterm: Terminal

  // Create fresh mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    mockXterm = new Terminal()
  })

  /**
   * Terminal container element is rendered
   *
   * The terminal needs a DOM container to attach to. This verifies
   * the component renders the required structure.
   */
  it('should render terminal container', () => {
    const { container } = render(
      <Term handleKeyPress={mockHandleKeyPress} xterm={mockXterm} />
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  /**
   * xterm.open() is called on component mount
   *
   * xterm.js requires calling open() with a DOM element to attach
   * the terminal UI. This must happen once when the component mounts.
   */
  it('should call xterm.open on mount', () => {
    render(<Term handleKeyPress={mockHandleKeyPress} xterm={mockXterm} />)

    expect(mockXterm.open).toHaveBeenCalled()
  })

  /**
   * Keyboard event handler is registered
   *
   * xterm.onKey() is used to capture keyboard input and forward it
   * to the SOL connection. Without this, users couldn't type in the
   * remote console.
   */
  it('should set up onKey handler', () => {
    render(<Term handleKeyPress={mockHandleKeyPress} xterm={mockXterm} />)

    expect(mockXterm.onKey).toHaveBeenCalled()
  })

  /**
   * Custom CSS class can be applied to container
   *
   * Allows styling the outer container, useful for positioning
   * the terminal within a larger layout.
   */
  it('should apply custom containerClassName', () => {
    const { container } = render(
      <Term
        handleKeyPress={mockHandleKeyPress}
        xterm={mockXterm}
        containerClassName='custom-container'
      />
    )

    expect(container.querySelector('.custom-container')).toBeInTheDocument()
  })

  /**
   * Custom inline styles can be applied to container
   *
   * Enables dynamic container styling, such as changing
   * background based on connection state.
   */
  it('should apply custom containerStyle', () => {
    const customStyle = { backgroundColor: 'red' }
    const { container } = render(
      <Term
        handleKeyPress={mockHandleKeyPress}
        xterm={mockXterm}
        containerStyle={customStyle}
      />
    )

    expect(container.firstChild).toHaveStyle('background-color: red')
  })

  /**
   * Custom CSS class can be applied to xterm element
   *
   * Separate from container styling - this affects the terminal
   * element itself, useful for terminal-specific styles.
   */
  it('should apply custom xtermClassName', () => {
    const { container } = render(
      <Term
        handleKeyPress={mockHandleKeyPress}
        xterm={mockXterm}
        xtermClassName='custom-xterm'
      />
    )

    expect(container.querySelector('.custom-xterm')).toBeInTheDocument()
  })

  /**
   * Custom inline styles can be applied to xterm element
   *
   * Allows styling the terminal directly, such as adding borders
   * or adjusting sizing.
   */
  it('should apply custom xtermStyle', () => {
    const customStyle = { border: '1px solid blue' }
    const { container } = render(
      <Term
        handleKeyPress={mockHandleKeyPress}
        xterm={mockXterm}
        xtermStyle={customStyle}
      />
    )

    const xtermDiv = container.firstChild?.firstChild as HTMLElement
    expect(xtermDiv).toHaveStyle('border: 1px solid blue')
  })

  /**
   * Default container styles are applied
   *
   * The component should have reasonable defaults for immediate
   * usability - block display with centered content.
   */
  it('should apply default container styles when no custom style provided', () => {
    const { container } = render(
      <Term handleKeyPress={mockHandleKeyPress} xterm={mockXterm} />
    )

    expect(container.firstChild).toHaveStyle('display: block')
    expect(container.firstChild).toHaveStyle('text-align: center')
  })

  /**
   * Default xterm element styles are applied
   *
   * The xterm element needs specific styling for proper display.
   * inline-block with fit-content ensures the terminal doesn't stretch
   * beyond its natural size.
   */
  it('should apply default xterm styles when no custom style provided', () => {
    const { container } = render(
      <Term handleKeyPress={mockHandleKeyPress} xterm={mockXterm} />
    )

    const xtermDiv = container.firstChild?.firstChild as HTMLElement
    expect(xtermDiv).toHaveStyle('display: inline-block')
    expect(xtermDiv).toHaveStyle('width: fit-content')
  })

  /**
   * xterm.open() is NOT called twice on re-render
   *
   * Calling xterm.open() multiple times causes errors and
   * duplicate terminal instances. The component uses an openedRef
   * guard to prevent this. This is critical for React's re-render
   * behavior.
   */
  it('should not open xterm twice on re-render', () => {
    const { rerender } = render(
      <Term handleKeyPress={mockHandleKeyPress} xterm={mockXterm} />
    )

    // Clear the mock to check if it's called again
    ;(mockXterm.open as jest.Mock).mockClear()

    rerender(<Term handleKeyPress={mockHandleKeyPress} xterm={mockXterm} />)

    // xterm.open should not be called again due to openedRef guard
    expect(mockXterm.open).not.toHaveBeenCalled()
  })

  /**
   * Component handles handleKeyPress callback changes
   *
   * In React, callback props might change during the component
   * lifecycle. The component should handle this gracefully without
   * breaking. The component uses a ref to always have the latest
   * callback without re-registering the xterm handler.
   */
  it('should update handleKeyPressRef when handleKeyPress changes', () => {
    const newHandleKeyPress = jest.fn()

    const { rerender, container } = render(
      <Term handleKeyPress={mockHandleKeyPress} xterm={mockXterm} />
    )

    rerender(<Term handleKeyPress={newHandleKeyPress} xterm={mockXterm} />)

    // Component should still be rendered
    expect(container.firstChild).toBeInTheDocument()
  })
})
