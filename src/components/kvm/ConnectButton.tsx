/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * ConnectButton Component
 *
 * Button to establish or terminate KVM connection.
 * Displays different text based on connection state:
 * - Disconnected (0): "Connect"
 * - Connecting (1): "Connecting..."
 * - Connected (2): "Disconnect"
 */

import React from 'react'
import { useTranslation } from 'react-i18next'

// Default styles for the connect button
const DEFAULT_BUTTON_STYLES: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
}

// Props for the ConnectButton component
export interface ConnectProps {
  kvmstate: number // Connection state: 0=disconnected, 1=connecting, 2=connected
  handleConnectClick: (e: React.MouseEvent) => void // Callback for button click
  className?: string // Custom CSS class for button
  style?: React.CSSProperties // Custom inline styles for button
}

export const ConnectButton: React.FC<ConnectProps> = ({
  kvmstate,
  handleConnectClick,
  className,
  style
}) => {
  const { t } = useTranslation()

  // Returns localized button text based on connection state
  const getButtonText = (): string => {
    if (kvmstate === 1) return t('kvm.connecting')
    if (kvmstate === 2) return t('kvm.disconnect')
    return t('kvm.connect')
  }

  return (
    <button
      className={className}
      style={style ?? DEFAULT_BUTTON_STYLES}
      onClick={handleConnectClick}
    >
      {getButtonText()}
    </button>
  )
}
