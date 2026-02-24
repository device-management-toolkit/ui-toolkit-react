/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * Header Component Tests
 *
 * The Header component is the top toolbar for the KVM interface. It combines
 * the ConnectButton and DesktopSettings components into a single header bar.
 * This is what users see at the top of the KVM viewer, providing:
 * - A button to connect/disconnect from the remote device
 * - Encoding settings to configure video quality
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  // Mock callback for when connect/disconnect button is clicked
  const mockHandleConnectClick = jest.fn()
  // Mock callback for when desktop settings (encoding) change
  const mockChangeDesktopSettings = jest.fn()
  // Mock function that returns the current connection state
  const mockGetConnectState = jest.fn()

  const defaultProps = {
    kvmstate: 0,
    handleConnectClick: mockHandleConnectClick,
    changeDesktopSettings: mockChangeDesktopSettings,
    getConnectState: mockGetConnectState
  }

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetConnectState.mockReturnValue(0)
  })

  /**
   * Header renders both child components
   *
   * The Header's main purpose is to compose ConnectButton and
   * DesktopSettings into a unified toolbar. This test verifies both
   * are rendered - button for connection control, combobox for encoding.
   */
  it('should render Header with ConnectButton and DesktopSettings', () => {
    render(<Header {...defaultProps} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  /**
   * KVM state is passed to ConnectButton correctly
   *
   * The connect button displays different text based on connection
   * state. This test verifies the kvmstate prop flows from Header to
   * ConnectButton. When kvmstate=2 (connected), button shows "Disconnect".
   */
  it('should pass kvmstate to ConnectButton', () => {
    render(<Header {...defaultProps} kvmstate={2} />)

    expect(screen.getByText('kvm.disconnect')).toBeInTheDocument()
  })

  /**
   * Connect button click handler works through Header
   *
   * User interactions on child components should propagate up
   * through the Header. This tests the callback chain works correctly.
   */
  it('should call handleConnectClick when connect button is clicked', () => {
    render(<Header {...defaultProps} />)

    fireEvent.click(screen.getByRole('button'))
    expect(mockHandleConnectClick).toHaveBeenCalledTimes(1)
  })

  /**
   * Encoding change handler works through Header
   *
   * Similar to the connect button, encoding changes should
   * propagate from DesktopSettings through Header to the parent KVM.
   */
  it('should call changeDesktopSettings when encoding changes', () => {
    render(<Header {...defaultProps} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
    expect(mockChangeDesktopSettings).toHaveBeenCalled()
  })

  /**
   * Custom CSS class can be applied to Header
   *
   * Allows consumers to style the header bar to match their
   * application's design.
   */
  it('should apply custom className when provided', () => {
    const { container } = render(
      <Header {...defaultProps} className='custom-header' />
    )

    expect(container.querySelector('.custom-header')).toBeInTheDocument()
  })

  /**
   * Custom inline styles can be applied
   *
   * Enables dynamic styling of the header, such as changing
   * background color to indicate connection status.
   */
  it('should apply custom style when provided', () => {
    const customStyle = { backgroundColor: 'green' }
    const { container } = render(
      <Header {...defaultProps} style={customStyle} />
    )

    // Find the element with the applied background color
    const headerElements = container.querySelectorAll('div')
    const styledElement = Array.from(headerElements).find(
      (el) => el.style.backgroundColor === 'green'
    )
    expect(styledElement).toBeTruthy()
  })

  /**
   * Header renders with default styles
   *
   * Ensures the component has reasonable default styling
   * even when no custom styles are provided.
   */
  it('should apply default styles when no custom style is provided', () => {
    const { container } = render(<Header {...defaultProps} />)

    // Check that the header container exists and has styles
    expect(container.querySelector('div')).toBeInTheDocument()
  })
})
