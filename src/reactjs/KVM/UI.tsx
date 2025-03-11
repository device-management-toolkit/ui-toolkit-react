/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 * Author : Ramu Bachala
 **********************************************************************/

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
} from '@open-amt-cloud-toolkit/ui-toolkit/core'
import { Header } from './Header'
import { PureCanvas } from './PureCanvas'
import React, { useState, useRef, useEffect, useCallback } from 'react'

import './UI.scss'

export interface KVMProps {
  deviceId: string | null
  mpsServer: string | null
  mouseDebounceTime: number
  canvasHeight: string
  canvasWidth: string
  autoConnect?: boolean
  authToken: string
}

export const KVM = ({
  deviceId,
  mpsServer,
  mouseDebounceTime,
  canvasHeight,
  canvasWidth,
  autoConnect,
  authToken
}: KVMProps): React.ReactElement => {
  const [kvmstate, setKvmState] = useState(0)
  const [encodingOption, setEncodingOption] = useState(1)
  
  const moduleRef = useRef<Desktop | null>(null)
  const dataProcessorRef = useRef<IDataProcessor | null>(null)
  const redirectorRef = useRef<IKvmDataCommunicator | null>(null)
  const mouseHelperRef = useRef<MouseHelper | null>(null)
  const keyboardRef = useRef<KeyBoardHelper | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const desktopSettingsChangeRef = useRef(false)

  const init = useCallback(() => {
    if (!ctxRef.current) return

    const deviceUuid: string = deviceId != null ? deviceId : ''
    const server: string = mpsServer != null ? mpsServer.replace('http', 'ws') : ''
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
    dataProcessorRef.current = new DataProcessor(redirectorRef.current, moduleRef.current)
    mouseHelperRef.current = new MouseHelper(
      moduleRef.current, 
      redirectorRef.current, 
      mouseDebounceTime < 200 ? 200 : mouseDebounceTime
    )
    keyboardRef.current = new KeyBoardHelper(moduleRef.current, redirectorRef.current)

    if (redirectorRef.current && moduleRef.current && dataProcessorRef.current) {
      redirectorRef.current.onProcessData = moduleRef.current.processData.bind(moduleRef.current)
      redirectorRef.current.onStart = moduleRef.current.start.bind(moduleRef.current)
      redirectorRef.current.onNewState = moduleRef.current.onStateChange.bind(moduleRef.current)
      redirectorRef.current.onSendKvmData = moduleRef.current.onSendKvmData.bind(moduleRef.current)
      redirectorRef.current.onStateChanged = onConnectionStateChange
      redirectorRef.current.onError = onRedirectorError
      moduleRef.current.onSend = redirectorRef.current.send.bind(redirectorRef.current)
      moduleRef.current.onProcessData = dataProcessorRef.current.processData.bind(dataProcessorRef.current)
      moduleRef.current.bpp = encodingOption
    }
  }, [deviceId, mpsServer, mouseDebounceTime, authToken, encodingOption])

  const cleanUp = useCallback(() => {
    moduleRef.current = null
    redirectorRef.current = null
    dataProcessorRef.current = null
    mouseHelperRef.current = null
    keyboardRef.current = null
    
    if (ctxRef.current) {
      ctxRef.current.clearRect(0, 0, ctxRef.current.canvas.height, ctxRef.current.canvas.width)
    }
  }, [])

  const reset = useCallback(() => {
    cleanUp()
    init()
  }, [cleanUp, init])

  const onRedirectorError = useCallback(() => {
    reset()
  }, [reset])

  const onConnectionStateChange = useCallback((redirector: any, state: number) => {
    setKvmState(state)
    
    if (desktopSettingsChangeRef.current && state === 0) {
      desktopSettingsChangeRef.current = false
      setTimeout(() => startKVM(), 2000) // Introduced delay to start KVM
    }
  }, [])

  const startKVM = useCallback(() => {
    if (redirectorRef.current) {
      redirectorRef.current.start(WebSocket)
    }
    if (keyboardRef.current) {
      keyboardRef.current.GrabKeyInput()
    }
  }, [])

  const stopKVM = useCallback(() => {
    if (redirectorRef.current) {
      redirectorRef.current.stop()
    }
    if (keyboardRef.current) {
      keyboardRef.current.UnGrabKeyInput()
    }
    reset()
  }, [reset])

  const changeDesktopSettings = useCallback((settings: any) => {
    if (kvmstate === 2) {
      desktopSettingsChangeRef.current = true
      if (moduleRef.current) {
        moduleRef.current.bpp = settings.encoding
      }
      stopKVM()
    } else {
      setEncodingOption(parseInt(settings.encoding))
      if (moduleRef.current) {
        moduleRef.current.bpp = parseInt(settings.encoding)
      }
    }
  }, [kvmstate, stopKVM])

  const handleConnectClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (kvmstate === 0) {
      startKVM()
    } else if (kvmstate === 1) {
      // Take Action
    } else if (kvmstate === 2) {
      stopKVM()
    } else {
      // Take Action
    }
  }, [kvmstate, startKVM, stopKVM])

  const getRenderStatus = useCallback(() => {
    return moduleRef.current?.state || 0
  }, [])

  const saveContext = useCallback((ctx: CanvasRenderingContext2D) => {
    ctxRef.current = ctx
    init()
  }, [init])

  // Handle device ID changes - equivalent to componentDidUpdate
  useEffect(() => {
    let prevDeviceId = deviceId
    
    return () => {
      if (prevDeviceId !== deviceId) {
        stopKVM()
      }
    }
  }, [deviceId, stopKVM])

  // Cleanup on unmount - equivalent to componentWillUnmount
  useEffect(() => {
    return () => {
      stopKVM()
    }
  }, [stopKVM])

  return (
    <div className="canvas-container">
      {autoConnect && (
        <Header 
          key="kvm_header"
          handleConnectClick={handleConnectClick}
          getConnectState={() => kvmstate}
          kvmstate={kvmstate}
          changeDesktopSettings={changeDesktopSettings}
          deviceId={deviceId}
          server={mpsServer}
        />
      )}
      <PureCanvas
        key="kvm_comp"
        contextRef={saveContext}
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        mouseMove={event => { 
          if (mouseHelperRef.current) {
            // Convert React.MouseEvent to native MouseEvent
            const nativeEvent = event.nativeEvent;
            mouseHelperRef.current.mousemove(nativeEvent);
          }
        }}
        mouseDown={event => { 
          if (mouseHelperRef.current) {
            const nativeEvent = event.nativeEvent;
            mouseHelperRef.current.mousedown(nativeEvent);
          }
        }}
        mouseUp={event => { 
          if (mouseHelperRef.current) {
            const nativeEvent = event.nativeEvent;
            mouseHelperRef.current.mouseup(nativeEvent);
          }
        }}
      />
    </div>
  )
}