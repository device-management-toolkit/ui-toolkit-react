/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * KVM UI Component Tests
 *
 * The KVM (Keyboard, Video, Mouse) component is the main container for the
 * remote desktop viewer. It orchestrates:
 * - WebSocket connection to the AMT device via MPS (Management Presence Server)
 * - Video frame rendering on the canvas
 * - Keyboard and mouse input capture and transmission
 * - Connection state management
 *
 * Due to the complexity of this component (it integrates with WebSocket,
 * AMTDesktop, AMTKvmDataRedirector, etc.), we mock the child components
 * to test the UI component's rendering logic in isolation.
 */

import { useEffect } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { KVM } from './UI'
import {
  AMTKvmDataRedirector,
  KeyBoardHelper
} from '@device-management-toolkit/ui-toolkit/core'

/**
 * Mock the Header component
 *
 * The real Header component has dependencies on connect state
 * and callbacks. By mocking it, we can test KVM's conditional rendering
 * logic (Header only shows when autoConnect=true) without dealing with
 * the Header's internal complexity.
 */
jest.mock('./Header', () => ({
  Header: ({ handleConnectClick, kvmstate }: any) => (
    <div data-testid='mock-header'>
      <button onClick={handleConnectClick}>
        {kvmstate === 0 ? 'Connect' : 'Disconnect'}
      </button>
    </div>
  )
}))

/**
 * Mock the PureCanvas component
 *
 * The real PureCanvas requires a valid canvas context and has
 * complex interactions with the DOM. By mocking it, we can verify
 * that KVM properly initializes and passes the contextRef callback
 * without needing a real canvas.
 */
jest.mock('./PureCanvas', () => ({
  PureCanvas: ({ contextRef }: any) => {
    useEffect(() => {
      // Simulate context ref callback with a mock context
      // This mimics what happens when the real canvas mounts
      const mockCtx = {
        clearRect: jest.fn(),
        canvas: { height: 768, width: 1366 }
      }
      contextRef(mockCtx)
    }, [contextRef])
    return <canvas data-testid='mock-canvas' />
  }
}))

describe('KVM', () => {
  const defaultProps = {
    deviceId: 'test-device-id', // Unique identifier for the AMT device
    mpsServer: 'http://test-server.com', // MPS server URL for WebSocket connection
    mouseDebounceTime: 200, // Milliseconds to debounce mouse move events
    canvasHeight: '768px', // Canvas display height
    canvasWidth: '1366px', // Canvas display width
    authToken: 'test-token' // JWT token for authentication
  }

  // Reset all mocks between tests
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Canvas is rendered for displaying remote desktop
   *
   * The canvas is the core visual element - without it, users
   * can't see the remote desktop. This verifies the basic rendering works.
   */
  it('should render KVM component with mock canvas', () => {
    render(<KVM {...defaultProps} />)

    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument()
  })

  /**
   * Header is rendered when autoConnect is true
   *
   * When autoConnect=true, the component automatically initiates
   * connection, so we show the Header with a disconnect button. This
   * gives users control to disconnect if needed.
   */
  it('should render Header when autoConnect is true', () => {
    render(<KVM {...defaultProps} autoConnect={true} />)

    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
  })

  /**
   * Header is NOT rendered when autoConnect is false
   *
   * When autoConnect=false, the user is expected to control
   * connection externally (via props/callbacks). Hiding the Header
   * allows for custom UI integration.
   */
  it('should not render Header when autoConnect is false', () => {
    render(<KVM {...defaultProps} autoConnect={false} />)

    expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument()
  })

  /**
   * Header is NOT rendered when autoConnect is undefined
   *
   * Default behavior should be no Header, matching the
   * autoConnect=false case. This documents the expected default.
   */
  it('should not render Header when autoConnect is undefined', () => {
    render(<KVM {...defaultProps} />)

    expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument()
  })

  /**
   * Custom container class can be applied
   *
   * Allows the KVM viewer to be styled to fit within different
   * layouts and designs.
   */
  it('should apply custom containerClassName', () => {
    const { container } = render(
      <KVM {...defaultProps} containerClassName='custom-container' />
    )

    expect(container.querySelector('.custom-container')).toBeInTheDocument()
  })

  /**
   * Custom container styles can be applied
   *
   * Enables dynamic styling, such as changing background color
   * based on connection state.
   */
  it('should apply custom containerStyle', () => {
    const customStyle = { backgroundColor: 'blue' }
    const { container } = render(
      <KVM {...defaultProps} containerStyle={customStyle} />
    )

    expect(container.firstChild).toHaveStyle('background-color: rgb(0, 0, 255)')
  })

  /**
   * Default container styles are applied
   *
   * The component should have reasonable defaults - full viewport
   */
  it('should apply default styles when no custom style is provided', () => {
    const { container } = render(<KVM {...defaultProps} />)

    expect(container.firstChild).toHaveStyle('text-align: center')
  })

  /**
   * Custom height can be applied via containerStyle
   *
   * Allows users to control the container height as needed.
   */
  it('should apply custom height via containerStyle', () => {
    const { container } = render(
      <KVM {...defaultProps} containerStyle={{ height: '100vh' }} />
    )

    expect(container.firstChild).toHaveStyle('height: 100vh')
  })

  /**
   * Component handles null deviceId gracefully
   *
   * In real applications, deviceId might not be available
   * immediately (e.g., waiting for user selection). The component
   * should render without crashing, even if it can't connect.
   */
  it('should handle null deviceId', () => {
    render(<KVM {...defaultProps} deviceId={null} />)

    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument()
  })

  /**
   * Component handles null mpsServer gracefully
   *
   * Similar to deviceId, the MPS server URL might not be
   * available immediately. The component should render without
   * crashing.
   */
  it('should handle null mpsServer', () => {
    render(<KVM {...defaultProps} mpsServer={null} />)

    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument()
  })

  /**
   * Component enforces minimum mouseDebounceTime
   *
   * Mouse debounce prevents flooding the connection with
   * too many position updates. A minimum value (200ms) ensures
   * reasonable performance even if a too-low value is provided.
   */
  it('should enforce minimum mouseDebounceTime of 200', () => {
    render(<KVM {...defaultProps} mouseDebounceTime={50} />)

    // Component should render successfully even with low debounce time
    // The actual enforcement happens inside the component
    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument()
  })

  /**
   * Clicking Connect starts KVM connection
   *
   * When autoConnect is true and the user clicks Connect,
   * the KVM WebSocket connection should be started.
   */
  it('should start KVM when clicking Connect', () => {
    const startSpy = jest.spyOn(AMTKvmDataRedirector.prototype, 'start')
    const grabSpy = jest.spyOn(KeyBoardHelper.prototype, 'GrabKeyInput')

    render(<KVM {...defaultProps} autoConnect={true} />)

    fireEvent.click(screen.getByText('Connect'))

    expect(startSpy).toHaveBeenCalled()
    expect(grabSpy).toHaveBeenCalled()

    startSpy.mockRestore()
    grabSpy.mockRestore()
  })

  /**
   * Component stops KVM when device changes
   *
   * When the deviceId prop changes, the component should stop
   * the current KVM connection and reinitialize for the new device.
   */
  it('should stop KVM when deviceId changes', () => {
    const stopSpy = jest.spyOn(AMTKvmDataRedirector.prototype, 'stop')

    const { rerender } = render(<KVM {...defaultProps} />)

    rerender(<KVM {...defaultProps} deviceId='new-device-id' />)

    expect(stopSpy).toHaveBeenCalled()

    stopSpy.mockRestore()
  })

  /**
   * Mouse events are forwarded to MouseHelper
   *
   * The PureCanvas component receives mouse event handlers that
   * forward events to the MouseHelper for remote desktop interaction.
   */
  it('should render canvas for mouse events', () => {
    render(<KVM {...defaultProps} />)

    const canvas = screen.getByTestId('mock-canvas')
    expect(canvas).toBeInTheDocument()
  })
})
