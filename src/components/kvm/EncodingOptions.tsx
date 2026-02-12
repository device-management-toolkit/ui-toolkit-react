/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * EncodingOptions Component
 *
 * Dropdown selector for KVM encoding options:
 * - RLE8: 8-bit Run Length Encoding (lower bandwidth, less color depth)
 * - RLE16: 16-bit Run Length Encoding (higher bandwidth, better colors)
 *
 * The dropdown is disabled when connected (state=2) to prevent
 * encoding changes during an active session.
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Default styles for the container span
const DEFAULT_CONTAINER_STYLES: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
}

// Returns select styles based on connection state (disabled when connected)
const getSelectStyles = (isConnected: boolean): React.CSSProperties => ({
  padding: '5px 10px',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  opacity: isConnected ? 0.6 : 1,
  cursor: isConnected ? 'not-allowed' : 'pointer'
})

// Props for the EncodingOptions component
export interface IEncodingOptions {
  changeEncoding: (encoding: number) => void // Callback when encoding changes
  getConnectState: () => number // Returns current connection state
  className?: string // Custom CSS class for container
  style?: React.CSSProperties // Custom inline styles for container
  selectClassName?: string // Custom CSS class for select element
  selectStyle?: React.CSSProperties // Custom inline styles for select element
}

export const EncodingOptions: React.FC<IEncodingOptions> = ({
  changeEncoding,
  getConnectState,
  className,
  style,
  selectClassName,
  selectStyle
}) => {
  const { t } = useTranslation()
  // Current encoding selection: 1=RLE8, 2=RLE16
  const [value, setValue] = useState<number>(1)

  // Handles dropdown change - updates state and notifies parent
  const onEncodingChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newValue = parseInt(e.target.value)
    setValue(newValue)
    changeEncoding(newValue)
  }

  const isConnected = getConnectState() === 2

  return (
    <span className={className} style={style ?? DEFAULT_CONTAINER_STYLES}>
      <label>{t('kvm.encoding')}:</label>
      <select
        value={value}
        className={selectClassName}
        style={selectStyle ?? getSelectStyles(isConnected)}
        onChange={onEncodingChange}
        disabled={isConnected}
      >
        <option value='1'>{t('kvm.encodingOptions.rle8')}</option>
        <option value='2'>{t('kvm.encodingOptions.rle16')}</option>
      </select>
    </span>
  )
}
