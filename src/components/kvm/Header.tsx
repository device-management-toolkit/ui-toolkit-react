/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * Header Component
 *
 * Control bar displayed above the KVM canvas containing:
 * - ConnectButton: To establish/terminate the KVM connection
 * - DesktopSettings: Encoding options dropdown
 *
 */

import React from 'react'
import { ConnectButton } from './ConnectButton'
import { DesktopSettings } from './DesktopSettings'

// Default styles for the header container
const DEFAULT_HEADER_STYLES: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #ddd'
}

// Props for the Header component
export interface IHeaderProps {
  kvmstate: number // Connection state: 0=disconnected, 1=connecting, 2=connected
  handleConnectClick: (e: React.MouseEvent) => void // Callback for connect button click
  changeDesktopSettings: (settings: { encoding: number }) => void // Callback for encoding change
  getConnectState: () => number // Returns current connection state
  className?: string // Custom CSS class for header
  style?: React.CSSProperties // Custom inline styles for header
  connectButtonClassName?: string // Custom CSS class for connect button
  connectButtonStyle?: React.CSSProperties // Custom inline styles for connect button
  encodingClassName?: string // Custom CSS class for encoding container
  encodingStyle?: React.CSSProperties // Custom inline styles for encoding container
  encodingSelectClassName?: string // Custom CSS class for encoding select
  encodingSelectStyle?: React.CSSProperties // Custom inline styles for encoding select
}

export const Header: React.FC<IHeaderProps> = ({
  kvmstate,
  handleConnectClick,
  changeDesktopSettings,
  getConnectState,
  className,
  style,
  connectButtonClassName,
  connectButtonStyle,
  encodingClassName,
  encodingStyle,
  encodingSelectClassName,
  encodingSelectStyle
}) => {
  return (
    <>
      <div className={className} style={style ?? DEFAULT_HEADER_STYLES}>
        <ConnectButton
          handleConnectClick={handleConnectClick}
          kvmstate={kvmstate}
          className={connectButtonClassName}
          style={connectButtonStyle}
        />
        <DesktopSettings
          changeDesktopSettings={changeDesktopSettings}
          getConnectState={getConnectState}
          className={encodingClassName}
          style={encodingStyle}
          selectClassName={encodingSelectClassName}
          selectStyle={encodingSelectStyle}
        />
      </div>
    </>
  )
}
