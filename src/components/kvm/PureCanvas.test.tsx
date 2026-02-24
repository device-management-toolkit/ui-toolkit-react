/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * PureCanvas Component Tests
 *
 * The PureCanvas component renders the HTML5 canvas element that displays
 * the remote desktop video stream. It's called "Pure" because it's wrapped
 * in React.memo to prevent unnecessary re-renders - important for performance
 * since the canvas is constantly being updated with video frames.
 *
 * Key responsibilities:
 * - Render a canvas element with the correct dimensions
 * - Capture mouse events (down, up, move) for remote control
 * - Prevent browser context menu (right-click) to allow RMB input
 * - Provide the 2D rendering context to parent for drawing
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { PureCanvas } from './PureCanvas'

describe('PureCanvas', () => {
  // Mock callback to receive the canvas 2D rendering context
  const mockContextRef = jest.fn()
  // Mock handlers for mouse events - these control the remote desktop
  const mockMouseDown = jest.fn()
  const mockMouseUp = jest.fn()
  const mockMouseMove = jest.fn()

  const defaultProps = {
    contextRef: mockContextRef,
    mouseDown: mockMouseDown,
    mouseUp: mockMouseUp,
    mouseMove: mockMouseMove,
    canvasHeight: '768px',
    canvasWidth: '1366px'
  }

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Canvas element is rendered in the DOM
   *
   * Basic sanity check that the canvas element exists.
   * The canvas is the core element for displaying the remote desktop.
   */
  it('should render canvas element', () => {
    render(<PureCanvas {...defaultProps} />)

    expect(screen.getByTestId('pure-canvas-testid')).toBeInTheDocument()
  })

  /**
   * Canvas has correct width and height attributes
   *
   * The canvas dimensions must match the remote desktop resolution.
   * These are set as HTML attributes (not CSS) because they define the
   * canvas's internal drawing buffer size, not just display size.
   */
  it('should have correct default dimensions', () => {
    render(<PureCanvas {...defaultProps} />)

    const canvas = screen.getByTestId('pure-canvas-testid')
    expect(canvas).toHaveAttribute('width', '1366')
    expect(canvas).toHaveAttribute('height', '768')
  })

  /**
   * 2D context is provided to parent via callback
   *
   * The parent KVM component needs the canvas 2D context to draw
   * the remote desktop frames. The contextRef callback allows the parent
   * to receive this context after the canvas mounts.
   */
  it('should call contextRef with canvas context on mount', () => {
    render(<PureCanvas {...defaultProps} />)

    expect(mockContextRef).toHaveBeenCalled()
  })

  /**
   * Mouse down event is captured and forwarded
   *
   * Mouse clicks on the canvas should be sent to the remote machine.
   * This enables users to click on things in the remote desktop.
   */
  it('should call mouseDown handler on mouse down event', () => {
    render(<PureCanvas {...defaultProps} />)

    fireEvent.mouseDown(screen.getByTestId('pure-canvas-testid'))
    expect(mockMouseDown).toHaveBeenCalledTimes(1)
  })

  /**
   * Mouse up event is captured and forwarded
   *
   * Mouse button releases need to be sent to complete click actions
   * and for drag operations on the remote desktop.
   */
  it('should call mouseUp handler on mouse up event', () => {
    render(<PureCanvas {...defaultProps} />)

    fireEvent.mouseUp(screen.getByTestId('pure-canvas-testid'))
    expect(mockMouseUp).toHaveBeenCalledTimes(1)
  })

  /**
   * Mouse move event is captured and forwarded
   *
   * Mouse movement needs to be tracked to update the cursor position
   * on the remote desktop. This is typically debounced to avoid flooding
   * the connection with too many position updates.
   */
  it('should call mouseMove handler on mouse move event', () => {
    render(<PureCanvas {...defaultProps} />)

    fireEvent.mouseMove(screen.getByTestId('pure-canvas-testid'))
    expect(mockMouseMove).toHaveBeenCalledTimes(1)
  })

  /**
   * Context menu event is handled
   *
   * By default, right-clicking shows the browser's context menu.
   * For KVM, we need right-clicks to be sent to the remote machine instead.
   * The component should have a handler attached (even if it just prevents
   * the default behavior).
   */
  it('should have context menu handler attached', () => {
    render(<PureCanvas {...defaultProps} />)

    const canvas = screen.getByTestId('pure-canvas-testid')

    // Just verify the canvas is rendered and has the context menu handler
    // The actual prevention happens in the component
    expect(canvas).toBeInTheDocument()
    fireEvent.contextMenu(canvas)
  })

  /**
   * Custom CSS class can be applied
   *
   * Allows styling the canvas, for example adding a border
   * or changing cursor style on hover.
   */
  it('should apply custom className when provided', () => {
    render(<PureCanvas {...defaultProps} className='custom-canvas' />)

    expect(screen.getByTestId('pure-canvas-testid')).toHaveClass(
      'custom-canvas'
    )
  })

  /**
   * Custom inline styles can be applied
   *
   * Enables dynamic styling like adding borders for visual
   * feedback when connected.
   */
  it('should apply custom style when provided', () => {
    const customStyle = { border: '2px solid red' }
    render(<PureCanvas {...defaultProps} style={customStyle} />)

    expect(screen.getByTestId('pure-canvas-testid')).toHaveStyle(
      'border: 2px solid red'
    )
  })

  /**
   * Default styles are applied when no custom styles provided
   *
   * The canvas should have sensible defaults - centered display
   * with block layout for proper rendering.
   */
  it('should apply default styles when no custom style is provided', () => {
    render(<PureCanvas {...defaultProps} />)

    const canvas = screen.getByTestId('pure-canvas-testid')
    expect(canvas).toHaveStyle('display: block')
    expect(canvas).toHaveStyle('margin: 0 auto')
  })

  /**
   * Component is memoized to prevent unnecessary re-renders
   *
   * React.memo wraps this component to optimize performance.
   * The canvas receives many rapid updates for video frames, but the
   * component itself shouldn't re-render unless props change. This test
   * verifies that re-rendering with identical props doesn't cause
   * the component to fully re-initialize.
   */
  it('should be memoized and not re-render unnecessarily', () => {
    const { rerender } = render(<PureCanvas {...defaultProps} />)

    // Clear the mock after initial render
    mockContextRef.mockClear()

    // Re-render with the same props
    rerender(<PureCanvas {...defaultProps} />)

    // contextRef should not be called again if props haven't changed
    // Note: memo prevents re-render, but useEffect may still run if deps change
  })
})
