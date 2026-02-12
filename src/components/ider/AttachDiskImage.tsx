/*********************************************************************
 * Copyright (c) Intel Corporation 2023
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * AttachDiskImage Component
 *
 * A complete UI component for IDE Redirection (IDER) that allows users to:
 * - Select an ISO file from their local machine
 * - Mount it as a virtual CD-ROM on a remote AMT device
 * - Start/stop the IDER session
 *
 */

import React, { useState, useCallback, useRef } from 'react'
import { IDER } from './ider'
import { useTranslation } from 'react-i18next'
import { logger } from '../../utils/logger'

// Default styles for the container and input elements
const DEFAULT_CONTAINER_STYLES: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '10px'
}

// Default styles for the file select button
const DEFAULT_FILE_SELECT_STYLES: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '14px',
  color: '#333',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer'
}

// Default styles for the file name display
const DEFAULT_FILE_NAME_STYLES: React.CSSProperties = {
  padding: '8px',
  fontSize: '14px',
  color: '#666'
}

// Returns button styles based on whether a file is selected or not
const getButtonStyles = (hasFile: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#fff',
  backgroundColor: hasFile ? '#007bff' : '#ccc',
  border: 'none',
  borderRadius: '4px',
  cursor: hasFile ? 'pointer' : 'not-allowed'
})

// Props for the AttachDiskImage component
export interface AttachDiskImageProps {
  deviceId: string | null // AMT device GUID
  mpsServer: string | null // MPS server URL
  authToken?: string // Authentication token for the MPS server
  fileSelectLabel?: string // Custom label for the file select button (default: 'Choose File')
  noFileSelectedLabel?: string // Custom label when no file is selected (default: 'No file chosen')
  containerClassName?: string // Custom CSS class for the container div
  containerStyle?: React.CSSProperties // Custom inline styles for the container div
  buttonClassName?: string // Custom CSS class for the start/stop button
  buttonStyle?: React.CSSProperties // Custom inline styles for the start/stop button
  fileSelectClassName?: string // Custom CSS class for the file select button
  fileSelectStyle?: React.CSSProperties // Custom inline styles for the file select button
  fileNameClassName?: string // Custom CSS class for the file name display
  fileNameStyle?: React.CSSProperties // Custom inline styles for the file name display
}

export const AttachDiskImage: React.FC<AttachDiskImageProps> = ({
  deviceId,
  mpsServer,
  authToken,
  fileSelectLabel,
  noFileSelectedLabel,
  containerClassName,
  containerStyle,
  buttonClassName,
  buttonStyle,
  fileSelectClassName,
  fileSelectStyle,
  fileNameClassName,
  fileNameStyle
}) => {
  const { t } = useTranslation()

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for the selected ISO file
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  // IDER connection state: 0 = stopped, 1 = running
  const [iderState, setIderState] = useState<number>(0)

  // Triggers the hidden file input
  const handleFileSelectClick = useCallback((): void => {
    fileInputRef.current?.click()
  }, [])

  // Handles file selection from the input element
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files !== null ? event.target.files[0] : null
      logger.log('IDER file selected:', file?.name ?? 'none')
      setSelectedFile(file ?? null)
    },
    []
  )

  // Callback passed to IDER component to sync state
  const updateIderState = useCallback((newState: number): void => {
    logger.log('IDER state updated:', newState === 0 ? 'stopped' : 'running')
    setIderState(newState)
  }, [])

  // Toggles IDER session on/off when button is clicked
  const handleButtonClick = useCallback((): void => {
    if (iderState === 0) {
      updateIderState(1) // Start IDER
    } else {
      updateIderState(0) // Stop IDER
    }
  }, [iderState, updateIderState])

  return (
    <div
      className={containerClassName}
      style={containerStyle ?? DEFAULT_CONTAINER_STYLES}
    >
      <IDER
        iderState={iderState}
        updateIderState={updateIderState}
        deviceId={deviceId}
        mpsServer={mpsServer}
        authToken={authToken}
        cdrom={selectedFile}
        floppy={null}
        iderData={null}
        data-testid='ider-component'
      />
      <input
        ref={fileInputRef}
        data-testid='file-input'
        type='file'
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type='button'
          onClick={handleFileSelectClick}
          className={fileSelectClassName}
          style={fileSelectStyle ?? DEFAULT_FILE_SELECT_STYLES}
        >
          {fileSelectLabel ?? t('ider.selectFile')}
        </button>
        <span
          className={fileNameClassName}
          style={fileNameStyle ?? DEFAULT_FILE_NAME_STYLES}
        >
          {selectedFile?.name ??
            noFileSelectedLabel ??
            t('ider.noFileSelected')}
        </span>
      </div>
      <button
        className={buttonClassName}
        style={buttonStyle ?? getButtonStyles(selectedFile !== null)}
        onClick={handleButtonClick}
        disabled={selectedFile === null}
      >
        {iderState === 0 ? t('ider.start') : t('ider.stop')}
      </button>
    </div>
  )
}
