/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * EncodingOptions Component Tests
 *
 * The EncodingOptions component provides a dropdown selector for choosing
 * the video encoding format used in KVM sessions. The encoding affects
 * video quality and bandwidth usage:
 * - RLE8 (value=1): 8-bit color, lower bandwidth, suitable for slow connections
 * - RLE16 (value=2): 16-bit color, better quality, requires more bandwidth
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { EncodingOptions } from './EncodingOptions'

describe('EncodingOptions', () => {
  // Mock function to track encoding changes
  const mockChangeEncoding = jest.fn()
  // Mock function that returns the current connection state
  const mockGetConnectState = jest.fn()

  // Reset mocks before each test and set default state to disconnected
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetConnectState.mockReturnValue(0) // 0 = disconnected
  })

  /**
   * Component renders with label and dropdown
   *
   * Basic rendering test to ensure the component structure is correct.
   * The label helps users understand what the dropdown controls.
   */
  it('should render encoding options with label', () => {
    render(
      <EncodingOptions
        changeEncoding={mockChangeEncoding}
        getConnectState={mockGetConnectState}
      />
    )

    expect(screen.getByText('kvm.encoding:')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  /**
   * Both encoding options (RLE8 and RLE16) are available
   *
   * Users need to see all available encoding options to make
   * an informed choice based on their network conditions.
   */
  it('should render both encoding options', () => {
    render(
      <EncodingOptions
        changeEncoding={mockChangeEncoding}
        getConnectState={mockGetConnectState}
      />
    )

    expect(screen.getByText('kvm.encodingOptions.rle8')).toBeInTheDocument()
    expect(screen.getByText('kvm.encodingOptions.rle16')).toBeInTheDocument()
  })

  /**
   * Parent component is notified when encoding selection changes
   *
   * The parent KVM component needs to know when the user changes
   * the encoding so it can configure the connection appropriately.
   * The value should be passed as a number (not string).
   */
  it('should call changeEncoding when selection changes', () => {
    render(
      <EncodingOptions
        changeEncoding={mockChangeEncoding}
        getConnectState={mockGetConnectState}
      />
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
    expect(mockChangeEncoding).toHaveBeenCalledWith(2)
  })

  /**
   * Dropdown is disabled when connected (state=2)
   *
   * Changing encoding during an active KVM session would disrupt
   * the connection. The dropdown should be disabled to prevent users
   * from attempting to change encoding mid-session.
   */
  it('should disable select when connected (state 2)', () => {
    mockGetConnectState.mockReturnValue(2) // 2 = connected

    render(
      <EncodingOptions
        changeEncoding={mockChangeEncoding}
        getConnectState={mockGetConnectState}
      />
    )

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  /**
   * Dropdown is enabled when not connected
   *
   * Users should be able to select their preferred encoding
   * before starting a connection.
   */
  it('should enable select when not connected', () => {
    mockGetConnectState.mockReturnValue(0) // 0 = disconnected

    render(
      <EncodingOptions
        changeEncoding={mockChangeEncoding}
        getConnectState={mockGetConnectState}
      />
    )

    expect(screen.getByRole('combobox')).not.toBeDisabled()
  })

  /**
   * Default encoding value is RLE8 (value=1)
   *
   * RLE8 is the safer default as it uses less bandwidth.
   * This test documents the expected initial state.
   */
  it('should have default value of 1', () => {
    render(
      <EncodingOptions
        changeEncoding={mockChangeEncoding}
        getConnectState={mockGetConnectState}
      />
    )

    expect(screen.getByRole('combobox')).toHaveValue('1')
  })

  /**
   * Custom CSS classes can be applied
   *
   * Allows styling customization. The component supports separate
   * classes for the container and the select element itself.
   */
  it('should apply custom className when provided', () => {
    render(
      <EncodingOptions
        changeEncoding={mockChangeEncoding}
        getConnectState={mockGetConnectState}
        className='custom-container'
        selectClassName='custom-select'
      />
    )

    expect(screen.getByRole('combobox')).toHaveClass('custom-select')
  })

  /**
   * Custom inline styles can be applied
   *
   * Allows dynamic styling. Supports separate styles for
   * the container and select element.
   */
  it('should apply custom styles when provided', () => {
    const customStyle = { backgroundColor: 'blue' }
    const customSelectStyle = { border: '2px solid red' }

    render(
      <EncodingOptions
        changeEncoding={mockChangeEncoding}
        getConnectState={mockGetConnectState}
        style={customStyle}
        selectStyle={customSelectStyle}
      />
    )

    expect(screen.getByRole('combobox')).toHaveStyle('border: 2px solid red')
  })
})
