/*********************************************************************
 * Copyright (c) Intel Corporation 2023
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

/**
 * IDER (IDE Redirection) Component
 *
 * This is a headless component that manages IDE redirection connections to AMT devices.
 * IDE redirection allows mounting local ISO/floppy images to remote AMT-enabled machines,
 * enabling remote OS installation and recovery operations.
 *
 * This component renders nothing (returns null) - it only handles connection logic.
 */

import {
  AMTRedirector,
  Protocol,
  AMTIDER,
  RedirectorConfig
} from '@device-management-toolkit/ui-toolkit/core'
import React, { useRef, useEffect, useCallback } from 'react'
import { logger } from '../../utils/logger'

// Props for the IDER component
export interface IDERProps {
  iderState: number // Current IDER connection state: 0 = stopped, 1 = running
  updateIderState: (newState: number) => void // Callback to update the IDER state
  iderData: IDERData | null // Statistics tracking for IDER read/write operations
  cdrom: File | null // ISO image file to mount as CD-ROM
  floppy: File | null // Floppy image file to mount
  mpsServer: string | null // MPS server URL
  authToken?: string // Authentication token for the MPS server
  deviceId: string | null // Target AMT device GUID
}

// Statistics tracking for IDER read/write operations
export interface IDERData {
  floppyRead: number
  floppyWrite: number
  cdromRead: number
  cdromWrite: number
}

export const IDER: React.FC<IDERProps> = ({
  iderState,
  updateIderState,
  iderData: _iderData,
  cdrom,
  floppy: _floppy,
  mpsServer,
  authToken,
  deviceId
}) => {
  // Refs to hold instances across renders (persisted between re-renders)
  const redirectorRef = useRef<AMTRedirector | null>(null) // WebSocket connection manager
  const iderRef = useRef<AMTIDER | null>(null) // IDER protocol handler
  const prevIderStateRef = useRef<number>(iderState) // Track previous state to detect changes

  // Callback fired when WebSocket connection state changes.
  const onConnectionStateChange = useCallback(
    (_redirector: AMTRedirector, state: number): void => {
      logger.log('IDER connection state changed:', state)
    },
    []
  )

  // Tracks sector read/write statistics for monitoring data transfer.
  const iderSectorStats = useCallback(
    (
      mode: number,
      dev: number,
      total: number,
      start: number,
      len: number
    ): void => {
      if (iderRef.current === null) return
      if (mode === 1) {
        // Read operation
        if (dev === 0) {
          iderRef.current.floppyRead += len * 512 // Floppy
        } else {
          iderRef.current.cdromRead += len * 2048 // CD-ROM
        }
      } else {
        // Write operation
        if (dev === 0) {
          iderRef.current.floppyWrite += len * 512 // Floppy
        } else {
          iderRef.current.cdromWrite += len * 2048 // CD-ROM
        }
      }
    },
    []
  )

  // Cleanup function to reset refs when stopping or unmounting
  const cleanup = useCallback((): void => {
    redirectorRef.current = null
    iderRef.current = null
  }, [])

  /**
   * Starts the IDER session:
   * 1. Creates AMTIDER instance with the selected CD-ROM file
   * 2. Binds protocol callbacks to the redirector
   * 3. Initiates WebSocket connection to the AMT device
   */
  const startIder = useCallback((): void => {
    logger.log('IDER starting for device:', deviceId)
    updateIderState(1)
    if (redirectorRef.current !== null) {
      // Create IDER handler with CD-ROM file (floppy is null)
      iderRef.current = new AMTIDER(redirectorRef.current, cdrom, null)

      // Bind IDER protocol handlers to the WebSocket redirector
      redirectorRef.current.onNewState = iderRef.current.stateChange.bind(
        iderRef.current
      )
      redirectorRef.current.onProcessData = iderRef.current.processData.bind(
        iderRef.current
      )
      iderRef.current.sectorStats = iderSectorStats
      redirectorRef.current.onStateChanged = onConnectionStateChange

      // Start the WebSocket connection
      redirectorRef.current.start(WebSocket)
    }
  }, [
    cdrom,
    deviceId,
    updateIderState,
    iderSectorStats,
    onConnectionStateChange
  ])

  // Stops the IDER session and cleans up resources
  const stopIder = useCallback((): void => {
    logger.log('IDER stopping')
    updateIderState(0)
    if (redirectorRef.current !== null) {
      redirectorRef.current.stop()
      cleanup()
    }
  }, [updateIderState, cleanup])

  // Initialize the AMTRedirector on component mount.
  useEffect(() => {
    // Convert HTTP URL to WebSocket URL
    const server: string =
      mpsServer != null ? mpsServer.replace('http', 'ws') : ''

    // Configure the redirector for IDER protocol
    const config: RedirectorConfig = {
      mode: 'ider',
      protocol: Protocol.IDER,
      fr: new FileReader(), // Used for reading disk image files
      host: deviceId != null ? deviceId : '', // AMT device GUID
      port: 16994, // AMT redirection port
      user: '',
      pass: '',
      tls: 0,
      tls1only: 0,
      authToken: authToken != null ? authToken : '',
      server: server
    }
    redirectorRef.current = new AMTRedirector(config)

    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [deviceId, mpsServer, authToken, cleanup])

  // Based on iderState changes from parent component, starts or stops the IDER session.
  useEffect(() => {
    if (prevIderStateRef.current !== iderState) {
      if (iderState === 1) {
        startIder()
      } else {
        stopIder()
      }
      prevIderStateRef.current = iderState
    }
  }, [iderState, startIder, stopIder])

  // Headless component - no UI rendered
  return null
}
