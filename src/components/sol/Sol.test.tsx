/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * Sol Component Tests
 *
 * The Sol (Serial Over LAN) component provides remote console access to AMT
 * devices. Unlike KVM which shows graphical display, SOL shows text-based
 * console output - BIOS messages, boot logs, Linux/Windows text console, etc.
 *
 * Think of it as a remote serial port connection - useful for:
 * - BIOS configuration when graphics aren't available
 * - Headless server administration
 * - Boot troubleshooting
 * - Emergency console access
 *
 * The component integrates:
 * - AMTRedirector: WebSocket connection to MPS server
 * - AmtTerminal: AMT protocol handling for SOL data
 * - TerminalDataProcessor: Converts AMT data to xterm.js format
 * - xterm.js: Terminal emulator display
 *
 * Due to this complexity, we mock the external dependencies to test
 * the Sol component's UI logic in isolation.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { Sol } from './Sol'

/**
 * Mock the Terminal component
 *
 * The real Terminal component depends on xterm.js and DOM
 * manipulation. By mocking it, we can test Sol's conditional
 * rendering (terminal only shows when connected) without needing
 * a real terminal.
 */
jest.mock('./Terminal', () => ({
  __esModule: true,
  default: () => <div data-testid='mock-terminal'>Terminal</div>
}))

/**
 * Mock the ui-toolkit/core dependencies
 *
 * These classes handle the actual AMT protocol communication.
 * They use WebSockets and complex state machines. Mocking them allows
 * us to test the React component without real network connections.
 *
 * - Protocol: Constants for connection types (SOL=1, KVM=2, IDER=3)
 * - AmtTerminal: Processes terminal data from AMT format
 * - AMTRedirector: Manages WebSocket connection to MPS
 * - TerminalDataProcessor: Converts data for xterm display
 */
jest.mock('@device-management-toolkit/ui-toolkit/core', () => ({
  Protocol: { SOL: 1, KVM: 2, IDER: 3 },
  AmtTerminal: jest.fn().mockImplementation(() => ({
    onSend: null,
    StateChange: jest.fn(),
    TermSendKeys: jest.fn()
  })),
  AMTRedirector: jest.fn().mockImplementation(() => ({
    onNewState: null,
    onStateChanged: null,
    onProcessData: null,
    start: jest.fn(),
    stop: jest.fn(),
    send: jest.fn()
  })),
  TerminalDataProcessor: jest.fn().mockImplementation(() => ({
    processDataToXterm: null,
    clearTerminal: null,
    processData: jest.fn()
  }))
}))

/**
 * Mock xterm.js Terminal
 *
 * xterm.js is a complex library that requires DOM access.
 * We mock it to avoid jsdom limitations and focus on testing
 * the React integration.
 */
jest.mock('@xterm/xterm', () => ({
  Terminal: jest.fn().mockImplementation(() => ({
    open: jest.fn(),
    write: jest.fn(),
    reset: jest.fn(),
    dispose: jest.fn(),
    onKey: jest.fn(),
    hasSelection: jest.fn().mockReturnValue(false),
    getSelection: jest.fn().mockReturnValue('')
  }))
}))

describe('Sol', () => {
  const defaultProps = {
    deviceId: 'test-device-id', // AMT device GUID
    mpsServer: 'http://test-server.com', // MPS server URL
    authToken: 'test-token' // JWT authentication token
  }

  // Reset all mocks between tests
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Connect button is rendered in initial state
   *
   * When disconnected, users need a way to initiate the SOL
   * connection. The button is the primary interaction point.
   */
  it('should render Sol component with connect button', () => {
    render(<Sol {...defaultProps} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('sol.connect')).toBeInTheDocument()
  })

  /**
   * Connect button responds to clicks
   *
   * Clicking connect should initiate the SOL connection.
   * This test verifies the button is interactive.
   */
  it('should have clickable connect button', () => {
    render(<Sol {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(button).toBeInTheDocument()
  })

  /**
   * Custom CSS class can be applied to container
   *
   * Allows the SOL component to be styled to fit within
   * the parent application's design.
   */
  it('should apply custom containerClassName', () => {
    const { container } = render(
      <Sol {...defaultProps} containerClassName='custom-container' />
    )

    expect(container.querySelector('.custom-container')).toBeInTheDocument()
  })

  /**
   * Custom inline styles can be applied to container
   *
   * Enables dynamic styling based on application state.
   */
  it('should apply custom containerStyle', () => {
    const customStyle = { backgroundColor: 'green' }
    const { container } = render(
      <Sol {...defaultProps} containerStyle={customStyle} />
    )

    expect(container.firstChild).toHaveStyle('background-color: green')
  })

  /**
   * Custom CSS class can be applied to button
   *
   * Allows button styling to match application design system.
   */
  it('should apply custom buttonClassName', () => {
    render(<Sol {...defaultProps} buttonClassName='custom-button' />)

    expect(screen.getByRole('button')).toHaveClass('custom-button')
  })

  /**
   * Custom inline styles can be applied to button
   *
   * Enables dynamic button styling, such as changing color
   * based on connection state.
   */
  it('should apply custom buttonStyle', () => {
    const customStyle = { backgroundColor: 'purple' }
    render(<Sol {...defaultProps} buttonStyle={customStyle} />)

    expect(screen.getByRole('button')).toHaveStyle('background-color: purple')
  })

  /**
   * Default container styles are applied
   *
   * Component should look reasonable out of the box with
   * sensible default styling.
   */
  it('should apply default container styles when no custom style provided', () => {
    const { container } = render(<Sol {...defaultProps} />)

    expect(container.firstChild).toHaveStyle('display: block')
    expect(container.firstChild).toHaveStyle('text-align: center')
  })

  /**
   * Default button styles are applied
   *
   * Button should be visually recognizable with reasonable
   * default padding and font size.
   */
  it('should apply default button styles when no custom style provided', () => {
    render(<Sol {...defaultProps} />)

    const button = screen.getByRole('button')
    expect(button).toHaveStyle('padding: 10px 20px')
    expect(button).toHaveStyle('font-size: 14px')
  })

  /**
   * Component handles null deviceId gracefully
   *
   * Device ID might not be available immediately in the
   * application lifecycle. Component should render without crashing.
   */
  it('should handle null deviceId', () => {
    render(<Sol {...defaultProps} deviceId={null} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  /**
   * Component handles null mpsServer gracefully
   *
   * MPS server URL might be loaded asynchronously. Component
   * should render without crashing while waiting.
   */
  it('should handle null mpsServer', () => {
    render(<Sol {...defaultProps} mpsServer={null} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  /**
   * Component handles autoConnect prop
   *
   * autoConnect=true should automatically initiate connection
   * on mount. This test verifies the prop is accepted without errors.
   */
  it('should handle autoConnect prop', () => {
    render(<Sol {...defaultProps} autoConnect={true} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  /**
   * Terminal is not shown when disconnected
   *
   * The terminal display should only appear after successful
   * connection. In the initial (disconnected) state, only the
   * connect button should be visible.
   */
  it('should not show terminal when not connected', () => {
    render(<Sol {...defaultProps} />)

    // Terminal should not be visible when not connected
    expect(screen.queryByTestId('mock-terminal')).not.toBeInTheDocument()
  })
})
