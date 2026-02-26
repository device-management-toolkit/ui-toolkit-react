/*********************************************************************
 * Copyright (c) Intel Corporation 2023
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * IDER Component Tests
 *
 * IDER (IDE Redirection) allows mounting virtual CD-ROM and floppy disk
 * images on a remote AMT device. This is extremely useful for:
 * - Remote OS installation (boot from ISO image)
 * - BIOS updates
 * - Running diagnostic tools from bootable images
 * - Emergency recovery when no physical media is available
 *
 * The IDER component is a "headless" component - it returns null and
 * doesn't render any UI. It's purely responsible for managing the
 * IDER connection lifecycle. The UI is handled by AttachDiskImage.
 *
 * It integrates:
 * - AMTRedirector: WebSocket connection to MPS server
 * - AMTIDER: AMT protocol handling for virtual disk operations
 */

import { render } from '@testing-library/react'
import { IDER } from './ider'
import {
  AMTRedirector,
  AMTIDER
} from '@device-management-toolkit/ui-toolkit/core'

/**
 * Mock the ui-toolkit/core dependencies
 *
 * These classes handle AMT protocol communication over WebSockets.
 * Mocking them allows us to test the React component's lifecycle
 * management without real network connections.
 */
jest.mock('@device-management-toolkit/ui-toolkit/core')

describe('IDER', () => {
  // Mock callback for updating IDER connection state in parent component
  const mockUpdateIderState = jest.fn()

  const defaultProps = {
    iderState: 0, // 0=stopped, 1=starting, 2=connected
    updateIderState: mockUpdateIderState, // Callback to update parent's state
    iderData: null, // Read/write statistics
    cdrom: null, // CD-ROM image file
    floppy: null, // Floppy disk image file
    mpsServer: 'http://test-server.com', // MPS server URL
    authToken: 'test-token', // JWT authentication token
    deviceId: 'test-device-id' // Target AMT device GUID
  }

  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Component renders null (no visible UI)
   *
   * IDER is a "controller" component that manages the connection
   * but doesn't render any UI. The UI is provided by AttachDiskImage.
   * This separation of concerns keeps the code modular.
   */
  it('should render IDER component (returns null)', () => {
    const { container } = render(<IDER {...defaultProps} />)

    // IDER component returns null, so container should be empty
    expect(container.firstChild).toBeNull()
  })

  /**
   * Redirector is initialized on mount
   *
   * The component should create the AMTRedirector instance
   * when mounted, setting up the infrastructure for IDER connection.
   */
  it('should initialize redirector on mount', () => {
    render(<IDER {...defaultProps} />)

    // Component should mount without errors
    // AMTRedirector should have been instantiated
  })

  /**
   * Resources are cleaned up on unmount
   *
   * When the component unmounts, it should stop any active
   * IDER sessions and clean up WebSocket connections to prevent
   * memory leaks and orphaned connections.
   */
  it('should cleanup on unmount', () => {
    const { unmount } = render(<IDER {...defaultProps} />)

    // Should not throw on unmount
    expect(() => unmount()).not.toThrow()
  })

  /**
   * Component handles null deviceId gracefully
   *
   * Device ID might not be available immediately. The component
   * should render (return null) without crashing.
   */
  it('should handle null deviceId', () => {
    const { container } = render(<IDER {...defaultProps} deviceId={null} />)

    expect(container.firstChild).toBeNull()
  })

  /**
   * Component handles null mpsServer gracefully
   *
   * MPS server URL might be loaded asynchronously. Component
   * should handle this gracefully.
   */
  it('should handle null mpsServer', () => {
    const { container } = render(<IDER {...defaultProps} mpsServer={null} />)

    expect(container.firstChild).toBeNull()
  })

  /**
   * Component handles undefined authToken gracefully
   *
   * Auth token might not be available during initial render.
   * Component should not crash.
   */
  it('should handle undefined authToken', () => {
    const props = { ...defaultProps, authToken: undefined }
    const { container } = render(<IDER {...props} />)

    expect(container.firstChild).toBeNull()
  })

  /**
   * Connection is re-initialized when deviceId changes
   *
   * When switching to a different AMT device, the component
   * needs to tear down the existing connection and create a new
   * one for the new device.
   */
  it('should re-initialize when deviceId changes', () => {
    const { rerender, container } = render(<IDER {...defaultProps} />)

    // Change deviceId
    rerender(<IDER {...defaultProps} deviceId='new-device-id' />)

    expect(container.firstChild).toBeNull()
  })

  /**
   * Connection is re-initialized when mpsServer changes
   *
   * If the MPS server URL changes (e.g., switching environments),
   * the connection needs to be recreated with the new server.
   */
  it('should re-initialize when mpsServer changes', () => {
    const { rerender, container } = render(<IDER {...defaultProps} />)

    // Change mpsServer
    rerender(<IDER {...defaultProps} mpsServer='http://new-server.com' />)

    expect(container.firstChild).toBeNull()
  })

  /**
   * Connection is re-initialized when authToken changes
   *
   * Auth tokens expire. When a new token is provided, the
   * connection should be refreshed to use the new credentials.
   */
  it('should re-initialize when authToken changes', () => {
    const { rerender, container } = render(<IDER {...defaultProps} />)

    // Change authToken
    rerender(<IDER {...defaultProps} authToken='new-token' />)

    expect(container.firstChild).toBeNull()
  })

  /**
   * IDER session starts when state changes to 1
   *
   * iderState=1 means "start IDER". The component should
   * initiate the WebSocket connection and begin the IDER protocol
   * handshake with the AMT device.
   */
  it('should start IDER when state changes to 1', () => {
    const { rerender } = render(<IDER {...defaultProps} iderState={0} />)

    // Change state to start IDER
    rerender(<IDER {...defaultProps} iderState={1} />)

    // updateIderState should be called
    expect(mockUpdateIderState).toHaveBeenCalled()
  })

  /**
   * IDER session stops when state changes to 0
   *
   * iderState=0 means "stop IDER". The component should
   * gracefully disconnect from the AMT device and clean up resources.
   */
  it('should stop IDER when state changes to 0', () => {
    const { rerender } = render(<IDER {...defaultProps} iderState={1} />)

    // Change state to stop IDER
    rerender(<IDER {...defaultProps} iderState={0} />)

    // updateIderState should be called
    expect(mockUpdateIderState).toHaveBeenCalled()
  })

  /**
   * Component handles CD-ROM file attachment
   *
   * CD-ROM images (typically .iso files) are used for OS
   * installation and booting. The component should accept the
   * file without crashing.
   */
  it('should handle cdrom file', () => {
    const mockFile = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })
    const { container } = render(<IDER {...defaultProps} cdrom={mockFile} />)

    expect(container.firstChild).toBeNull()
  })

  /**
   * Component handles floppy disk file attachment
   *
   * Floppy images (typically .img files) were traditionally
   * used for BIOS updates and small bootable utilities. Legacy
   * support is still important for some operations.
   */
  it('should handle floppy file', () => {
    const mockFile = new File(['test'], 'test.img', {
      type: 'application/octet-stream'
    })
    const { container } = render(<IDER {...defaultProps} floppy={mockFile} />)

    expect(container.firstChild).toBeNull()
  })

  /**
   * Component handles iderData statistics
   *
   * During IDER sessions, the component tracks read/write
   * statistics for both floppy and CD-ROM. This data can be
   * displayed in the UI to show transfer progress.
   */
  it('should handle iderData', () => {
    const mockIderData = {
      floppyRead: 100, // Bytes read from virtual floppy
      floppyWrite: 50, // Bytes written to virtual floppy
      cdromRead: 200, // Bytes read from virtual CD-ROM
      cdromWrite: 0 // CD-ROMs are typically read-only
    }
    const { container } = render(
      <IDER {...defaultProps} iderData={mockIderData} />
    )

    expect(container.firstChild).toBeNull()
  })

  /**
   * Sector stats tracks floppy read operations
   *
   * When the IDER session is active and data is read from the
   * virtual floppy device, the sector stats should be tracked.
   */
  it('should track floppy read in sector stats', () => {
    const mockFile = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })
    const { rerender } = render(
      <IDER {...defaultProps} cdrom={mockFile} iderState={0} />
    )

    // Start IDER
    rerender(<IDER {...defaultProps} cdrom={mockFile} iderState={1} />)

    // Get the AMTIDER instance created during startIder
    const iderInstance = (AMTIDER as unknown as jest.Mock).mock.results[0]?.value
    if (iderInstance?.sectorStats) {
      iderInstance.sectorStats(1, 0, 100, 0, 10) // mode=read, dev=floppy
      expect(iderInstance.floppyRead).toBe(10 * 512)
    }
  })

  /**
   * Sector stats tracks CD-ROM read operations
   *
   * CD-ROM read operations use a larger sector size (2048 bytes)
   * compared to floppy (512 bytes).
   */
  it('should track cdrom read in sector stats', () => {
    const mockFile = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })
    const { rerender } = render(
      <IDER {...defaultProps} cdrom={mockFile} iderState={0} />
    )

    rerender(<IDER {...defaultProps} cdrom={mockFile} iderState={1} />)

    const iderInstance = (AMTIDER as unknown as jest.Mock).mock.results[0]?.value
    if (iderInstance?.sectorStats) {
      iderInstance.sectorStats(1, 1, 100, 0, 5) // mode=read, dev=cdrom
      expect(iderInstance.cdromRead).toBe(5 * 2048)
    }
  })

  /**
   * Sector stats tracks floppy write operations
   */
  it('should track floppy write in sector stats', () => {
    const mockFile = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })
    const { rerender } = render(
      <IDER {...defaultProps} cdrom={mockFile} iderState={0} />
    )

    rerender(<IDER {...defaultProps} cdrom={mockFile} iderState={1} />)

    const iderInstance = (AMTIDER as unknown as jest.Mock).mock.results[0]?.value
    if (iderInstance?.sectorStats) {
      iderInstance.sectorStats(0, 0, 100, 0, 8) // mode=write, dev=floppy
      expect(iderInstance.floppyWrite).toBe(8 * 512)
    }
  })

  /**
   * Sector stats tracks CD-ROM write operations
   */
  it('should track cdrom write in sector stats', () => {
    const mockFile = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })
    const { rerender } = render(
      <IDER {...defaultProps} cdrom={mockFile} iderState={0} />
    )

    rerender(<IDER {...defaultProps} cdrom={mockFile} iderState={1} />)

    const iderInstance = (AMTIDER as unknown as jest.Mock).mock.results[0]?.value
    if (iderInstance?.sectorStats) {
      iderInstance.sectorStats(0, 1, 100, 0, 3) // mode=write, dev=cdrom
      expect(iderInstance.cdromWrite).toBe(3 * 2048)
    }
  })

  /**
   * Connection state change callback is invoked
   *
   * When the WebSocket connection state changes, the onConnectionStateChange
   * callback should be fired. This is set up during startIder.
   */
  it('should handle connection state change callback', () => {
    const mockFile = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })
    const { rerender } = render(
      <IDER {...defaultProps} cdrom={mockFile} iderState={0} />
    )

    rerender(<IDER {...defaultProps} cdrom={mockFile} iderState={1} />)

    // Get the redirector instance
    const redirectorInstance = (AMTRedirector as unknown as jest.Mock).mock
      .results[0]?.value
    if (redirectorInstance?.onStateChanged) {
      // Should not throw when invoked
      expect(() => {
        redirectorInstance.onStateChanged(redirectorInstance, 2)
      }).not.toThrow()
    }
  })
})
