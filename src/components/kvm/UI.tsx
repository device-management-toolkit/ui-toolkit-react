/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 * Author : Ramu Bachala
 **********************************************************************/

/**
 * KVM (Keyboard, Video, Mouse) Component
 *
 * Provides remote desktop access to AMT-enabled devices via WebSocket.
 * Allows users to view the remote screen and control the device using
 * their local keyboard and mouse.
 *
 * Features:
 * - Real-time screen rendering on HTML5 canvas
 * - Keyboard and mouse input forwarding
 * - Configurable encoding (RLE8/RLE16) for bandwidth optimization
 * - Auto-reconnect on desktop settings change
 */

import {
  IDataProcessor,
  IKvmDataCommunicator,
  DataProcessor,
  Desktop,
  AMTKvmDataRedirector,
  AMTDesktop,
  Protocol,
  MouseHelper,
  KeyBoardHelper,
  RedirectorConfig
} from '@device-management-toolkit/ui-toolkit/core'
import { Header } from './Header'
import { PureCanvas } from './PureCanvas'
import { logger } from '../../utils/logger'
import React, { useState, useRef, useEffect, useCallback } from 'react'

// Default styles for the KVM container
const DEFAULT_CONTAINER_STYLES: React.CSSProperties = {
  textAlign: 'center',
  margin: 0,
  padding: 0,
  boxSizing: 'border-box'
}

// Props for the KVM component
export interface KVMProps {
  deviceId: string | null // Target AMT device GUID
  mpsServer: string | null // MPS server URL
  mouseDebounceTime: number // Debounce time (ms) for mouse movement events
  canvasHeight: string // Canvas height (CSS value)
  canvasWidth: string // Canvas width (CSS value)
  autoConnect?: boolean // Show header with connect controls
  authToken: string // Authentication token for MPS server
  containerClassName?: string // Custom CSS class for container
  containerStyle?: React.CSSProperties // Custom inline styles for container
  headerClassName?: string // Custom CSS class for header
  headerStyle?: React.CSSProperties // Custom inline styles for header
  connectButtonClassName?: string // Custom CSS class for connect button
  connectButtonStyle?: React.CSSProperties // Custom inline styles for connect button
  encodingClassName?: string // Custom CSS class for encoding container
  encodingStyle?: React.CSSProperties // Custom inline styles for encoding container
  encodingSelectClassName?: string // Custom CSS class for encoding select
  encodingSelectStyle?: React.CSSProperties // Custom inline styles for encoding select
  canvasClassName?: string // Custom CSS class for canvas
  canvasStyle?: React.CSSProperties // Custom inline styles for canvas
}

export const KVM: React.FC<KVMProps> = ({
  deviceId,
  mpsServer,
  mouseDebounceTime,
  canvasHeight,
  canvasWidth,
  autoConnect,
  authToken,
  containerClassName,
  containerStyle,
  headerClassName,
  headerStyle,
  connectButtonClassName,
  connectButtonStyle,
  encodingClassName,
  encodingStyle,
  encodingSelectClassName,
  encodingSelectStyle,
  canvasClassName,
  canvasStyle
}) => {
  // Connection state: 0=disconnected, 1=connecting, 2=connected
  const [kvmstate, setKvmstate] = useState<number>(0)
  // Current encoding option: 1=RLE8, 2=RLE16
  const [encodingOption, setEncodingOption] = useState<number>(1)

  // Refs to hold instances across renders
  const moduleRef = useRef<Desktop | null>(null) // AMT desktop renderer
  const dataProcessorRef = useRef<IDataProcessor | null>(null) // Processes incoming data
  const redirectorRef = useRef<IKvmDataCommunicator | null>(null) // WebSocket connection
  const mouseHelperRef = useRef<MouseHelper | null>(null) // Mouse event handler
  const keyboardRef = useRef<KeyBoardHelper | null>(null) // Keyboard event handler
  const desktopSettingsChangeRef = useRef<boolean>(false) // Flag for settings change reconnect
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null) // Canvas 2D context
  const prevDeviceIdRef = useRef<string | null>(deviceId) // Track device changes

  // Callback fired when WebSocket connection state changes.
  // Handles auto-reconnect after desktop settings change.
  const OnConnectionStateChange = useCallback(
    (redirector: IKvmDataCommunicator, state: number): void => {
      const stateNames = ['disconnected', 'connecting', 'connected']
      logger.log('KVM connection state changed:', stateNames[state] ?? state)
      setKvmstate(state)
      // If settings changed and connection dropped, auto-reconnect after delay
      if (desktopSettingsChangeRef.current && state === 0) {
        desktopSettingsChangeRef.current = false
        setTimeout(() => {
          if (redirectorRef.current !== null) {
            redirectorRef.current.start(WebSocket)
          }
          if (keyboardRef.current !== null) keyboardRef.current.GrabKeyInput()
        }, 2000)
      }
    },
    []
  )

  // Cleanup function to reset all refs and clear canvas
  const cleanUp = useCallback((): void => {
    moduleRef.current = null
    dataProcessorRef.current = null
    redirectorRef.current = null
    mouseHelperRef.current = null
    keyboardRef.current = null
    if (ctxRef.current !== null) {
      ctxRef.current.clearRect(
        0,
        0,
        ctxRef.current.canvas.height,
        ctxRef.current.canvas.width
      )
    }
  }, [])

  // Ref to store init function for error handler callback (avoids stale closure)
  const initRef = useRef<() => void>(() => {})

  /**
   * Initializes all KVM components:
   * - AMTDesktop: Renders remote screen to canvas
   * - AMTKvmDataRedirector: Manages WebSocket connection
   * - DataProcessor: Processes incoming KVM data
   * - MouseHelper: Handles mouse events and sends to device
   * - KeyBoardHelper: Captures keyboard input and sends to device
   */
  const init = useCallback((): void => {
    if (ctxRef.current === null) {
      logger.warn('KVM init called but canvas context is null')
      return
    }
    logger.log('KVM initializing for device:', deviceId)
    const deviceUuid: string = deviceId != null ? deviceId : ''
    const server: string =
      mpsServer != null ? mpsServer.replace('http', 'ws') : ''
    const debounceTime = mouseDebounceTime < 200 ? 200 : mouseDebounceTime
    const config: RedirectorConfig = {
      mode: 'kvm',
      protocol: Protocol.KVM,
      fr: new FileReader(),
      host: deviceUuid,
      port: 16994,
      user: '',
      pass: '',
      tls: 0,
      tls1only: 0,
      authToken: authToken,
      server: server
    }
    moduleRef.current = new AMTDesktop(ctxRef.current)
    redirectorRef.current = new AMTKvmDataRedirector(config)
    dataProcessorRef.current = new DataProcessor(
      redirectorRef.current,
      moduleRef.current
    )
    mouseHelperRef.current = new MouseHelper(
      moduleRef.current,
      redirectorRef.current,
      debounceTime
    )
    keyboardRef.current = new KeyBoardHelper(
      moduleRef.current,
      redirectorRef.current
    )

    redirectorRef.current.onProcessData = moduleRef.current.processData.bind(
      moduleRef.current
    )
    redirectorRef.current.onStart = moduleRef.current.start.bind(
      moduleRef.current
    )
    redirectorRef.current.onNewState = moduleRef.current.onStateChange.bind(
      moduleRef.current
    )
    redirectorRef.current.onSendKvmData = moduleRef.current.onSendKvmData.bind(
      moduleRef.current
    )
    redirectorRef.current.onStateChanged = OnConnectionStateChange
    redirectorRef.current.onError = () => {
      cleanUp()
      initRef.current()
    }
    moduleRef.current.onSend = redirectorRef.current.send.bind(
      redirectorRef.current
    )
    moduleRef.current.onProcessData = dataProcessorRef.current.processData.bind(
      dataProcessorRef.current
    )
    moduleRef.current.bpp = encodingOption
  }, [
    deviceId,
    mpsServer,
    authToken,
    mouseDebounceTime,
    encodingOption,
    OnConnectionStateChange,
    cleanUp
  ])

  // Keep initRef in sync with init (for error handler callback)
  useEffect(() => {
    initRef.current = init
  }, [init])

  // Resets and reinitializes all KVM components
  const reset = useCallback((): void => {
    cleanUp()
    init()
  }, [cleanUp, init])

  // Callback from PureCanvas - saves canvas context and initializes KVM
  const saveContext = useCallback(
    (ctx: CanvasRenderingContext2D): void => {
      ctxRef.current = ctx
      init()
    },
    [init]
  )

  // Starts the KVM WebSocket connection and captures keyboard input
  const startKVM = useCallback((): void => {
    logger.log('KVM starting connection')
    if (redirectorRef.current !== null) {
      redirectorRef.current.start(WebSocket)
    }
    if (keyboardRef.current !== null) keyboardRef.current.GrabKeyInput()
  }, [])

  // Stops KVM connection, releases keyboard capture, and resets components
  const stopKVM = useCallback((): void => {
    logger.log('KVM stopping connection')
    if (redirectorRef.current !== null) redirectorRef.current.stop()
    if (keyboardRef.current !== null) keyboardRef.current.UnGrabKeyInput()
    reset()
  }, [reset])

  // Handles encoding changes - triggers reconnect if currently connected
  const changeDesktopSettings = useCallback(
    (settings: { encoding: number | string }): void => {
      if (kvmstate === 2) {
        desktopSettingsChangeRef.current = true
        if (moduleRef.current !== null) {
          moduleRef.current.bpp =
            typeof settings.encoding === 'string'
              ? parseInt(settings.encoding)
              : settings.encoding
        }
        stopKVM()
      } else {
        const newEncoding =
          typeof settings.encoding === 'string'
            ? parseInt(settings.encoding)
            : settings.encoding
        setEncodingOption(newEncoding)
        if (moduleRef.current !== null) {
          moduleRef.current.bpp = newEncoding
        }
      }
    },
    [kvmstate, stopKVM]
  )

  // Toggles KVM connection on/off based on current state
  const handleConnectClick = useCallback(
    (_e: React.MouseEvent): void => {
      if (kvmstate === 0) {
        startKVM()
      } else if (kvmstate === 1) {
        // Currently connecting - no action
      } else if (kvmstate === 2) {
        stopKVM()
      }
    },
    [kvmstate, startKVM, stopKVM]
  )

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopKVM()
    }
  }, [])

  // Stop KVM and reset when device changes
  useEffect(() => {
    if (prevDeviceIdRef.current !== deviceId) {
      stopKVM()
      prevDeviceIdRef.current = deviceId
    }
  }, [deviceId, stopKVM])

  // Returns current connection state for child components
  const getConnectState = useCallback(() => kvmstate, [kvmstate])

  return (
    <div
      className={containerClassName}
      style={containerStyle ?? DEFAULT_CONTAINER_STYLES}
    >
      {autoConnect === true && (
        <Header
          key='kvm_header'
          handleConnectClick={handleConnectClick}
          getConnectState={getConnectState}
          kvmstate={kvmstate}
          changeDesktopSettings={changeDesktopSettings}
          className={headerClassName}
          style={headerStyle}
          connectButtonClassName={connectButtonClassName}
          connectButtonStyle={connectButtonStyle}
          encodingClassName={encodingClassName}
          encodingStyle={encodingStyle}
          encodingSelectClassName={encodingSelectClassName}
          encodingSelectStyle={encodingSelectStyle}
        />
      )}
      <PureCanvas
        key='kvm_comp'
        contextRef={saveContext}
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        className={canvasClassName}
        style={canvasStyle}
        mouseMove={(event) => {
          if (mouseHelperRef.current !== null) {
            mouseHelperRef.current.mousemove(event.nativeEvent)
          }
        }}
        mouseDown={(event) => {
          if (mouseHelperRef.current !== null) {
            mouseHelperRef.current.mousedown(event.nativeEvent)
          }
        }}
        mouseUp={(event) => {
          if (mouseHelperRef.current !== null) {
            mouseHelperRef.current.mouseup(event.nativeEvent)
          }
        }}
      />
    </div>
  )
}
