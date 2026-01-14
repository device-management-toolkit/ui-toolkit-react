/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * ConnectButton Component Tests
 *
 * The ConnectButton is a simple UI component that displays a button for
 * connecting/disconnecting from the KVM (Keyboard, Video, Mouse) session.
 * It shows different text based on the current connection state (kvmstate).
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { ConnectButton } from './ConnectButton'

describe('ConnectButton', () => {
  // Mock function to track when the connect/disconnect action is triggered
  const mockHandleConnectClick = jest.fn()

  // Reset all mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Basic rendering with disconnected state (kvmstate=0)
   *
   * Ensures the button renders correctly in its initial/disconnected state.
   * The button should show "Connect" text when not connected to a device.
   */
  it('should render connect button with default state', () => {
    render(
      <ConnectButton kvmstate={0} handleConnectClick={mockHandleConnectClick} />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('kvm.connect')).toBeInTheDocument()
  })

  /**
   * Button text during connection attempt (kvmstate=1)
   *
   * When the user clicks connect, there's a brief period where the
   * connection is being established. The button should show "Connecting..."
   * to provide feedback that the action is in progress.
   */
  it('should display connecting text when kvmstate is 1', () => {
    render(
      <ConnectButton kvmstate={1} handleConnectClick={mockHandleConnectClick} />
    )

    expect(screen.getByText('kvm.connecting')).toBeInTheDocument()
  })

  /**
   * Button text when connected (kvmstate=2)
   *
   * Once connected, the button should change to show "Disconnect"
   * so users know they can click to end the session.
   */
  it('should display disconnect text when kvmstate is 2', () => {
    render(
      <ConnectButton kvmstate={2} handleConnectClick={mockHandleConnectClick} />
    )

    expect(screen.getByText('kvm.disconnect')).toBeInTheDocument()
  })

  /**
   * Click handler is called when button is clicked
   *
   * This is the core functionality - when users click the button,
   * it should trigger the connect or disconnect action. This test verifies
   * the callback prop is invoked correctly.
   */
  it('should call handleConnectClick when button is clicked', () => {
    render(
      <ConnectButton kvmstate={0} handleConnectClick={mockHandleConnectClick} />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(mockHandleConnectClick).toHaveBeenCalledTimes(1)
  })

  /**
   * Custom CSS class can be applied
   *
   * Allows consumers of this component to apply their own styling
   * by passing a className prop. This is important for theming and
   * integration into different UI designs.
   */
  it('should apply custom className when provided', () => {
    render(
      <ConnectButton
        kvmstate={0}
        handleConnectClick={mockHandleConnectClick}
        className='custom-class'
      />
    )

    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  /**
   * Inline styles can be applied
   *
   * Similar to className, but for inline styles. Useful when
   * dynamic styling is needed (e.g., styles computed at runtime).
   */
  it('should apply custom style when provided', () => {
    const customStyle = { backgroundColor: 'red' }
    render(
      <ConnectButton
        kvmstate={0}
        handleConnectClick={mockHandleConnectClick}
        style={customStyle}
      />
    )

    expect(screen.getByRole('button')).toHaveStyle('background-color: red')
  })

  /**
   * Default styles are applied when no custom styles provided
   *
   * The component should have sensible default styling so it
   * looks reasonable out of the box. This test documents the expected
   * default appearance.
   */
  it('should apply default styles when no custom style is provided', () => {
    render(
      <ConnectButton kvmstate={0} handleConnectClick={mockHandleConnectClick} />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveStyle('padding: 10px 20px')
    expect(button).toHaveStyle('font-size: 14px')
  })
})
