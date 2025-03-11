/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { AmtTerminal, AMTRedirector, Protocol, TerminalDataProcessor, RedirectorConfig } from '@open-amt-cloud-toolkit/ui-toolkit/core'
import Style from 'styled-components'
import { Terminal } from '@xterm/xterm'
import Term from './Terminal'
import '@xterm/xterm/css/xterm.css'
import './sol.scss'

const StyledDiv = Style.div`
  display: inline-block;
  padding: 0px 5px;
`

const HeaderStrip = Style.div`
  background-color: darkgray;
  padding: 5px;
  font-size: 13px;
  text-align: center;
`

export interface SOLProps {
  deviceId: string | null
  mpsServer: string | null
  autoConnect?: boolean
  authToken: string
}

export const Sol = ({
  deviceId,
  mpsServer,
  autoConnect,
  authToken
}: SOLProps): React.ReactElement => {
  const [isConnected, setIsConnected] = useState(false)
  const [SOLstate, setSOLstate] = useState(0)
  const [powerState, setPowerState] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [isSelected, setIsSelected] = useState(true)
  const [type, setType] = useState('')
  const [solNotEnabled, setSolNotEnabled] = useState('')
  const [deviceOnSleep, setDeviceOnSleep] = useState('')
  const [isPowerStateLoaded, setIsPowerStateLoaded] = useState(false)
  
  const redirectorRef = useRef<any>(null)
  const terminalRef = useRef<any>(null)
  const loggerRef = useRef<any>(null)
  const dataProcessorRef = useRef<any>(null)
  const callbackRef = useRef<any>(null)
  const termRef = useRef<any>(null)

  const init = useCallback(() => {
    const server: string = mpsServer != null ? mpsServer.replace('http', 'ws') : ''
    const deviceUuid: string = deviceId != null ? deviceId : ''
    const config: RedirectorConfig = {
      mode: 'sol',
      protocol: Protocol.SOL,
      fr: new FileReader(),
      host: deviceUuid,
      port: 16994,
      user: '',
      pass: '',
      tls: 0,
      tls1only: 0,
      authToken: authToken,
      server: `${server}/relay`
    }
    
    terminalRef.current = new AmtTerminal()
    redirectorRef.current = new AMTRedirector(config)
    dataProcessorRef.current = new TerminalDataProcessor(terminalRef.current)
    
    if (terminalRef.current && redirectorRef.current && dataProcessorRef.current) {
      terminalRef.current.onSend = redirectorRef.current.send.bind(redirectorRef.current)
      redirectorRef.current.onNewState = terminalRef.current.StateChange.bind(terminalRef.current)
      redirectorRef.current.onStateChanged = onTerminalStateChange
      redirectorRef.current.onProcessData = dataProcessorRef.current.processData.bind(dataProcessorRef.current)
      dataProcessorRef.current.processDataToXterm = handleWriteToXterm
      dataProcessorRef.current.clearTerminal = handleClearTerminal
    }
    
    termRef.current = new Terminal({
      cursorStyle: 'block',
      fontWeight: 'bold',
      rows: 30,
      cols: 100
    })
  }, [mpsServer, deviceId, authToken])

  const cleanUp = useCallback(() => {
    terminalRef.current = null
    redirectorRef.current = null
    dataProcessorRef.current = null
    termRef.current = null
  }, [])

  // Initialize on mount
  useEffect(() => {
    init()
    
    // Cleanup on unmount
    return () => {
      cleanUp()
    }
  }, [init, cleanUp])

  const handleWriteToXterm = useCallback((str: string) => {
    if (termRef.current) {
      termRef.current.write(str)
    }
  }, [])

  const handleClearTerminal = useCallback(() => {
    if (termRef.current) {
      termRef.current.reset()
    }
  }, [])

  const handleKeyPress = useCallback((domEvent: any) => {
    if (terminalRef.current) {
      terminalRef.current.TermSendKeys(domEvent)
    }
  }, [])

  const handleKeyDownPress = useCallback((domEvent: any) => {
    if (terminalRef.current) {
      terminalRef.current.handleKeyDownEvents(domEvent)
    }
  }, [])

  const startSOL = useCallback(() => {
    if (redirectorRef.current) {
      redirectorRef.current.start(WebSocket)
    }
  }, [])

  const stopSOL = useCallback(() => {
    if (redirectorRef.current) {
      redirectorRef.current.stop()
    }
    handleClearTerminal()
    cleanUp()
    init()
  }, [cleanUp, init, handleClearTerminal])

  const handleSOLConnect = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (SOLstate === 0) {
      startSOL()
    } else {
      stopSOL()
    }
  }, [SOLstate, startSOL, stopSOL])

  const onTerminalStateChange = useCallback((redirector: any, state: number) => {
    setSOLstate(state)
  }, [])

  const handleFeatureStatus = useCallback((value: string) => {
    setSolNotEnabled(value)
  }, [])

  const getSOLState = useCallback(() => {
    return SOLstate === 3 ? 2 : 0
  }, [SOLstate])

  return (
    <>
      <button onClick={handleSOLConnect}>
        {SOLstate === 3 ? 'Disconnect' : 'Connect'}
      </button>
      {SOLstate === 3 && termRef.current && (
        <Term 
          handleKeyPress={handleKeyPress} 
          handleKeyDownPress={handleKeyDownPress} 
          xterm={termRef.current} 
        />
      )}
    </>
  )
}