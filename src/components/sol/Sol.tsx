/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * SOL (Serial Over LAN) Component
 *
 * Provides remote terminal access to AMT-enabled devices via Serial Over LAN.
 * This allows users to interact with the device's serial console remotely,
 * useful for BIOS configuration, OS installation, and system recovery.
 *
 * Uses xterm.js for terminal emulation.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  AmtTerminal,
  AMTRedirector,
  Protocol,
  TerminalDataProcessor,
  RedirectorConfig
} from '@device-management-toolkit/ui-toolkit/core'
import { Terminal } from '@xterm/xterm'
import { Term } from './Terminal'
import { useTranslation } from 'react-i18next'
import { logger } from '../../utils/logger'

// Default styles for the container
const DEFAULT_CONTAINER_STYLES: React.CSSProperties = {
  display: 'block',
  textAlign: 'center'
}

// Default styles for the connect/disconnect button
const DEFAULT_BUTTON_STYLES: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginBottom: '10px'
}

// Props for the SOL component
export interface SOLProps {
  deviceId: string | null // Target AMT device GUID
  mpsServer: string | null // MPS server URL
  autoConnect?: boolean // Auto-connect on mount (currently unused)
  authToken: string // Authentication token for MPS server
  containerClassName?: string // Custom CSS class for container
  containerStyle?: React.CSSProperties // Custom inline styles for container
  buttonClassName?: string // Custom CSS class for button
  buttonStyle?: React.CSSProperties // Custom inline styles for button
  terminalContainerClassName?: string // Custom CSS class for terminal container
  terminalContainerStyle?: React.CSSProperties // Custom inline styles for terminal container
  xtermClassName?: string // Custom CSS class for xterm element
  xtermStyle?: React.CSSProperties // Custom inline styles for xterm element
}

export const Sol: React.FC<SOLProps> = ({
  deviceId,
  mpsServer,
  autoConnect: _autoConnect,
  authToken,
  containerClassName,
  containerStyle,
  buttonClassName,
  buttonStyle,
  terminalContainerClassName,
  terminalContainerStyle,
  xtermClassName,
  xtermStyle
}) => {
  const { t } = useTranslation()

  // Connection state: 0=disconnected, 1=connecting, 2=connected, 3=ready
  const [SOLstate, setSOLstate] = useState<number>(0)
  // xterm.js Terminal instance for rendering
  const [xterm, setXterm] = useState<Terminal | null>(null)

  // Refs to hold instances across renders
  const redirectorRef = useRef<AMTRedirector | null>(null) // WebSocket connection manager
  const terminalRef = useRef<AmtTerminal | null>(null) // AMT terminal protocol handler
  const dataProcessorRef = useRef<TerminalDataProcessor | null>(null) // Processes data for terminal
  const termRef = useRef<Terminal | null>(null) // xterm.js instance reference

  // Writes received data to the terminal display
  const handleWriteToXterm = useCallback((str: string): void => {
    // Filter out DEL character (0x7f) that xterm can't parse
    const filtered = str.replace(/\x7f/g, '')
    if (filtered.length > 0) {
      termRef.current?.write(filtered)
    }
  }, [])

  // Clears/resets the terminal display
  const handleClearTerminal = useCallback((): void => {
    termRef.current?.reset()
  }, [])

  // Sends keyboard input to the remote AMT device
  const handleKeyPress = useCallback((domEvent: string): void => {
    terminalRef.current?.TermSendKeys(domEvent)
  }, [])

  // Updates connection state when WebSocket state changes
  const onTerminalStateChange = useCallback(
    (_redirector: AMTRedirector, state: number): void => {
      const stateNames = ['disconnected', 'connecting', 'connected', 'ready']
      logger.log('SOL connection state changed:', stateNames[state] ?? state)
      setSOLstate(state)
    },
    []
  )

  // Cleanup function to reset all refs
  const cleanUp = useCallback((): void => {
    terminalRef.current = null
    redirectorRef.current = null
    dataProcessorRef.current = null
    termRef.current = null
  }, [])

  // Initialize SOL components on mount or when connection params change.
  // Sets up: AMTRedirector, AmtTerminal, TerminalDataProcessor, and xterm.js
  useEffect(() => {
    // Convert HTTP URL to WebSocket URL
    const server: string =
      mpsServer != null ? mpsServer.replace('http', 'ws') : ''
    const deviceUuid: string = deviceId != null ? deviceId : ''

    // Configure the redirector for SOL protocol
    const config: RedirectorConfig = {
      mode: 'sol',
      protocol: Protocol.SOL,
      fr: new FileReader(),
      host: deviceUuid,
      port: 16994, // AMT redirection port
      user: '',
      pass: '',
      tls: 0,
      tls1only: 0,
      authToken: authToken != null ? authToken : '',
      server: server
    }

    // Create protocol handlers
    terminalRef.current = new AmtTerminal()
    redirectorRef.current = new AMTRedirector(config)
    dataProcessorRef.current = new TerminalDataProcessor(terminalRef.current)

    // Bind callbacks between components
    terminalRef.current.onSend = redirectorRef.current.send.bind(
      redirectorRef.current
    )
    redirectorRef.current.onNewState = terminalRef.current.StateChange.bind(
      terminalRef.current
    )
    redirectorRef.current.onStateChanged = onTerminalStateChange
    redirectorRef.current.onProcessData =
      dataProcessorRef.current.processData.bind(dataProcessorRef.current)
    dataProcessorRef.current.processDataToXterm = handleWriteToXterm
    dataProcessorRef.current.clearTerminal = handleClearTerminal

    // Create xterm.js terminal instance
    const term = new Terminal({
      cursorStyle: 'block',
      fontWeight: 'bold',
      rows: 30,
      cols: 100,
      scrollback: 0
    })
    termRef.current = term
    setXterm(term)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (redirectorRef.current !== null) {
        redirectorRef.current.stop()
      }
      termRef.current?.dispose()
      setXterm(null)
      cleanUp()
    }
  }, [
    deviceId,
    mpsServer,
    authToken,
    onTerminalStateChange,
    handleWriteToXterm,
    handleClearTerminal,
    cleanUp
  ])

  // Starts the SOL WebSocket connection
  const startSOL = useCallback((): void => {
    logger.log('SOL starting connection for device:', deviceId)
    if (redirectorRef.current !== null) {
      redirectorRef.current.start(WebSocket)
    }
  }, [deviceId])

  // Stops the SOL connection and resets terminal
  const stopSOL = useCallback((): void => {
    logger.log('SOL stopping connection')
    if (redirectorRef.current !== null) {
      redirectorRef.current.stop()
    }
    handleClearTerminal()
    setSOLstate(0)
  }, [handleClearTerminal])

  // Connection is ready when state is 3
  const isConnected = SOLstate === 3

  // Toggles SOL connection on/off
  const handleSOLConnect = useCallback(
    (_e: React.MouseEvent): void => {
      if (!isConnected) {
        startSOL()
      } else {
        stopSOL()
      }
    },
    [isConnected, startSOL, stopSOL]
  )

  return (
    <div
      className={containerClassName}
      style={containerStyle ?? DEFAULT_CONTAINER_STYLES}
    >
      <button
        className={buttonClassName}
        style={buttonStyle ?? DEFAULT_BUTTON_STYLES}
        onClick={handleSOLConnect}
      >
        {isConnected ? t('sol.disconnect') : t('sol.connect')}
      </button>

      {isConnected && xterm !== null && (
        <Term
          handleKeyPress={handleKeyPress}
          xterm={xterm}
          containerClassName={terminalContainerClassName}
          containerStyle={terminalContainerStyle}
          xtermClassName={xtermClassName}
          xtermStyle={xtermStyle}
        />
      )}
    </div>
  )
}
