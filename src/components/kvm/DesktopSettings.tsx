/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * DesktopSettings Component
 *
 * Container component that manages encoding settings state and passes
 * it to EncodingOptions for user selection. Uses a ref to maintain
 * settings state across renders without triggering re-renders.
 */

import React, { useRef } from 'react'
import { EncodingOptions } from './EncodingOptions'

// Props for the DesktopSettings component
export interface IDesktopSettings {
  changeDesktopSettings: (settings: { encoding: number }) => void // Callback when settings change
  getConnectState: () => number // Returns current connection state
  className?: string // Custom CSS class for encoding container
  style?: React.CSSProperties // Custom inline styles for encoding container
  selectClassName?: string // Custom CSS class for encoding select
  selectStyle?: React.CSSProperties // Custom inline styles for encoding select
}

export const DesktopSettings: React.FC<IDesktopSettings> = ({
  changeDesktopSettings,
  getConnectState,
  className,
  style,
  selectClassName,
  selectStyle
}) => {
  // Ref to hold current settings object (persists across renders)
  const desktopSettingsRef = useRef({ encoding: 1 })

  // Updates encoding in settings ref and notifies parent
  const changeEncoding = (encoding: number): void => {
    desktopSettingsRef.current.encoding = encoding
    changeDesktopSettings(desktopSettingsRef.current)
  }

  return (
    <EncodingOptions
      changeEncoding={changeEncoding}
      getConnectState={getConnectState}
      className={className}
      style={style}
      selectClassName={selectClassName}
      selectStyle={selectStyle}
    />
  )
}
