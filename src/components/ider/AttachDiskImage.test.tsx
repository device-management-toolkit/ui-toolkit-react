/*********************************************************************
 * Copyright (c) Intel Corporation 2023
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * AttachDiskImage Component Tests
 *
 * AttachDiskImage provides the user interface for IDER (IDE Redirection).
 * It allows users to:
 * - Select a disk image file (ISO for CD-ROM, IMG for floppy)
 * - Start/stop the IDER session
 *
 * This component works in conjunction with the headless IDER component
 * which handles the actual connection management. AttachDiskImage is
 * purely presentational and manages local UI state.
 *
 * Typical workflow:
 * 1. User selects an ISO/IMG file using the file input
 * 2. Start button becomes enabled
 * 3. User clicks Start to begin IDER session
 * 4. Button text changes to "Stop"
 * 5. AMT device can now boot from the virtual media
 * 6. User clicks Stop to end the session
 *
 * Key behaviors tested:
 * - File input and button are rendered
 * - Button is disabled until a file is selected
 * - Button text toggles between Start/Stop
 * - Supports custom styling for all elements
 * - Handles edge cases (null files, empty file lists)
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { AttachDiskImage } from './AttachDiskImage'

/**
 * Mock the ui-toolkit/core dependencies
 *
 * Prevents actual IDER connection attempts during tests.
 * We're testing the UI behavior, not the connection logic.
 */
jest.mock('@device-management-toolkit/ui-toolkit/core')

describe('AttachDiskImage', () => {
  const defaultProps = {
    deviceId: 'test-device-id', // Target AMT device GUID
    mpsServer: 'http://test-server.com', // MPS server URL
    authToken: 'test-token' // JWT authentication token
  }

  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Component renders file input, file select button, and start/stop button
   *
   * These are the essential UI elements - file picker button
   * to select the disk image, and button to start/stop IDER.
   */
  it('should render AttachDiskImage component', () => {
    render(<AttachDiskImage {...defaultProps} />)

    expect(screen.getByTestId('file-input')).toBeInTheDocument()
    expect(screen.getByText('ider.selectFile')).toBeInTheDocument()
    expect(screen.getByText('ider.start')).toBeInTheDocument()
  })

  /**
   * Button shows "Start" text initially
   *
   * Before any action, the button should indicate that
   * clicking it will start the IDER session.
   */
  it('should render start button text initially', () => {
    render(<AttachDiskImage {...defaultProps} />)

    expect(screen.getByText('ider.start')).toBeInTheDocument()
  })

  /**
   * Shows "No file chosen" text when no file is selected
   */
  it('should show no file selected text initially', () => {
    render(<AttachDiskImage {...defaultProps} />)

    expect(screen.getByText('ider.noFileSelected')).toBeInTheDocument()
  })

  /**
   * Button is disabled when no file is selected
   *
   * IDER requires a disk image to mount. Without a file,
   * starting IDER is meaningless. Disabling the button prevents
   * user confusion and invalid operations.
   */
  it('should have disabled button when no file is selected', () => {
    render(<AttachDiskImage {...defaultProps} />)

    expect(screen.getByText('ider.start')).toBeDisabled()
  })

  /**
   * Button becomes enabled when file is selected
   *
   * Once a valid file is chosen, the user should be able
   * to start the IDER session. This tests the state transition.
   */
  it('should enable button when file is selected', () => {
    render(<AttachDiskImage {...defaultProps} />)

    const input = screen.getByTestId('file-input')
    const file = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('ider.start')).not.toBeDisabled()
  })

  /**
   * Shows file name when file is selected
   */
  it('should show file name when file is selected', () => {
    render(<AttachDiskImage {...defaultProps} />)

    const input = screen.getByTestId('file-input')
    const file = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('test.iso')).toBeInTheDocument()
  })

  /**
   * Button text toggles between Start and Stop
   *
   * The button serves dual purpose - start when stopped,
   * stop when running. This tests the toggle behavior to ensure
   * users always see the correct action.
   */
  it('should toggle button text when clicked', () => {
    render(<AttachDiskImage {...defaultProps} />)

    const input = screen.getByTestId('file-input')
    const file = new File(['test'], 'test.iso', {
      type: 'application/octet-stream'
    })

    // Select a file first
    fireEvent.change(input, { target: { files: [file] } })

    const startButton = screen.getByText('ider.start')

    // Click to start - button should now show "Stop"
    fireEvent.click(startButton)
    expect(screen.getByText('ider.stop')).toBeInTheDocument()

    // Click to stop - button should return to "Start"
    const stopButton = screen.getByText('ider.stop')
    fireEvent.click(stopButton)
    expect(screen.getByText('ider.start')).toBeInTheDocument()
  })

  /**
   * Custom CSS class can be applied to container
   *
   * Allows the component to be styled to fit within
   * the parent application's layout and design.
   */
  it('should apply custom containerClassName', () => {
    const { container } = render(
      <AttachDiskImage
        {...defaultProps}
        containerClassName='custom-container'
      />
    )

    expect(container.querySelector('.custom-container')).toBeInTheDocument()
  })

  /**
   * Custom inline styles can be applied to container
   *
   * Enables dynamic styling based on application state.
   */
  it('should apply custom containerStyle', () => {
    const customStyle = { backgroundColor: 'red' }
    const { container } = render(
      <AttachDiskImage {...defaultProps} containerStyle={customStyle} />
    )

    expect(container.firstChild).toHaveStyle('background-color: red')
  })

  /**
   * Custom CSS class can be applied to start/stop button
   *
   * Allows button styling to match the application's
   * design system or button component library.
   */
  it('should apply custom buttonClassName', () => {
    render(
      <AttachDiskImage {...defaultProps} buttonClassName='custom-button' />
    )

    expect(screen.getByText('ider.start')).toHaveClass('custom-button')
  })

  /**
   * Custom inline styles can be applied to start/stop button
   *
   * Enables dynamic button styling, such as changing
   * color based on connection state.
   */
  it('should apply custom buttonStyle', () => {
    const customStyle = { backgroundColor: 'purple' }
    render(<AttachDiskImage {...defaultProps} buttonStyle={customStyle} />)

    expect(screen.getByText('ider.start')).toHaveStyle(
      'background-color: purple'
    )
  })

  /**
   * Custom CSS class can be applied to file select button
   */
  it('should apply custom fileSelectClassName', () => {
    render(
      <AttachDiskImage
        {...defaultProps}
        fileSelectClassName='custom-file-select'
      />
    )

    expect(screen.getByText('ider.selectFile')).toHaveClass(
      'custom-file-select'
    )
  })

  /**
   * Custom inline styles can be applied to file select button
   */
  it('should apply custom fileSelectStyle', () => {
    const customStyle = { backgroundColor: 'green' }
    render(<AttachDiskImage {...defaultProps} fileSelectStyle={customStyle} />)

    expect(screen.getByText('ider.selectFile')).toHaveStyle(
      'background-color: green'
    )
  })

  /**
   * Custom label can be applied to file select button
   */
  it('should apply custom fileSelectLabel', () => {
    render(<AttachDiskImage {...defaultProps} fileSelectLabel='Browse Files' />)

    expect(screen.getByText('Browse Files')).toBeInTheDocument()
  })

  /**
   * Custom label can be applied to no file selected text
   */
  it('should apply custom noFileSelectedLabel', () => {
    render(
      <AttachDiskImage
        {...defaultProps}
        noFileSelectedLabel='Please select a file'
      />
    )

    expect(screen.getByText('Please select a file')).toBeInTheDocument()
  })

  /**
   * Default container uses flex layout
   *
   * Flex layout with column direction stacks the file
   * input and button vertically for a clean default appearance.
   */
  it('should apply default container styles', () => {
    const { container } = render(<AttachDiskImage {...defaultProps} />)

    expect(container.firstChild).toHaveStyle('display: flex')
    expect(container.firstChild).toHaveStyle('flex-direction: column')
  })

  /**
   * Disabled button shows not-allowed cursor
   *
   * Visual feedback that the button is not clickable.
   * The cursor change reinforces the disabled state.
   */
  it('should apply default button styles when no file selected', () => {
    render(<AttachDiskImage {...defaultProps} />)

    const button = screen.getByText('ider.start')
    expect(button).toHaveStyle('cursor: not-allowed')
  })

  /**
   * File input is hidden (styled with display: none)
   */
  it('should have hidden file input', () => {
    render(<AttachDiskImage {...defaultProps} />)

    const input = screen.getByTestId('file-input')
    expect(input).toHaveStyle('display: none')
  })

  /**
   * Component handles null deviceId gracefully
   *
   * Device ID might not be available immediately.
   * Component should render without crashing.
   */
  it('should handle null deviceId', () => {
    render(<AttachDiskImage {...defaultProps} deviceId={null} />)

    expect(screen.getByTestId('file-input')).toBeInTheDocument()
  })

  /**
   * Component handles null mpsServer gracefully
   *
   * MPS server URL might be loaded asynchronously.
   * Component should render without crashing.
   */
  it('should handle null mpsServer', () => {
    render(<AttachDiskImage {...defaultProps} mpsServer={null} />)

    expect(screen.getByTestId('file-input')).toBeInTheDocument()
  })

  /**
   * Component handles undefined authToken gracefully
   *
   * Auth token might not be available during initial render.
   * Component should render without crashing.
   */
  it('should handle undefined authToken', () => {
    const props = { ...defaultProps, authToken: undefined }
    render(<AttachDiskImage {...props} />)

    expect(screen.getByTestId('file-input')).toBeInTheDocument()
  })

  /**
   * Button stays disabled with empty file list
   *
   * Edge case - file input change event with empty files array.
   * This can happen if user cancels file dialog. Button should
   * remain disabled.
   */
  it('should handle empty file list', () => {
    render(<AttachDiskImage {...defaultProps} />)

    const input = screen.getByTestId('file-input')

    fireEvent.change(input, { target: { files: [] } })

    expect(screen.getByText('ider.start')).toBeDisabled()
  })

  /**
   * Button stays disabled with null files
   *
   * Edge case - some browsers might set files to null
   * in certain scenarios. Component should handle this gracefully.
   */
  it('should handle null files', () => {
    render(<AttachDiskImage {...defaultProps} />)

    const input = screen.getByTestId('file-input')

    fireEvent.change(input, { target: { files: null } })

    expect(screen.getByText('ider.start')).toBeDisabled()
  })
})
