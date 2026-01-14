/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * DesktopSettings Component Tests
 *
 * The DesktopSettings component is a container that groups all KVM-related
 * settings.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { DesktopSettings } from './DesktopSettings'

describe('DesktopSettings', () => {
  // Mock function to receive settings changes from this component
  const mockChangeDesktopSettings = jest.fn()
  // Mock function that returns the current connection state
  const mockGetConnectState = jest.fn()

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetConnectState.mockReturnValue(0) // Start disconnected
  })

  /**
   * EncodingOptions component is rendered
   *
   * DesktopSettings is a container component. This test verifies
   * it correctly renders its child components. The combobox comes from
   * EncodingOptions.
   */
  it('should render EncodingOptions component', () => {
    render(
      <DesktopSettings
        changeDesktopSettings={mockChangeDesktopSettings}
        getConnectState={mockGetConnectState}
      />
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  /**
   * Encoding changes are wrapped in settings object format
   *
   * The parent KVM component expects settings in object format
   * like { encoding: 2 }. This allows the settings object to be
   * extended with additional properties in the future without
   * changing the API.
   */
  it('should call changeDesktopSettings when encoding changes', () => {
    render(
      <DesktopSettings
        changeDesktopSettings={mockChangeDesktopSettings}
        getConnectState={mockGetConnectState}
      />
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })

    // Note: The value is wrapped in an object with 'encoding' key
    expect(mockChangeDesktopSettings).toHaveBeenCalledWith({ encoding: 2 })
  })

  /**
   * Multiple encoding changes are handled correctly
   *
   * Users might change their mind and switch encoding multiple
   * times before connecting. Each change should correctly notify
   * the parent with the new value.
   */
  it('should maintain encoding state across changes', () => {
    render(
      <DesktopSettings
        changeDesktopSettings={mockChangeDesktopSettings}
        getConnectState={mockGetConnectState}
      />
    )

    // Change to encoding 2 (RLE16)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
    expect(mockChangeDesktopSettings).toHaveBeenCalledWith({ encoding: 2 })

    // Change back to encoding 1 (RLE8)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
    expect(mockChangeDesktopSettings).toHaveBeenCalledWith({ encoding: 1 })
  })

  /**
   * Connection state is passed down to child components
   *
   * Child components like EncodingOptions need to know the
   * connection state to disable themselves when connected.
   * This test verifies the state flows correctly through the
   * component hierarchy.
   */
  it('should pass getConnectState to EncodingOptions', () => {
    mockGetConnectState.mockReturnValue(2) // Connected state

    render(
      <DesktopSettings
        changeDesktopSettings={mockChangeDesktopSettings}
        getConnectState={mockGetConnectState}
      />
    )

    // Select should be disabled when connected
    // This proves getConnectState was passed to EncodingOptions
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})
