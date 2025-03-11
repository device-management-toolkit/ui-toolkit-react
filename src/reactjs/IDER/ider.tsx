/*********************************************************************
* Copyright (c) Intel Corporation 2023
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { AMTRedirector, Protocol, AMTIDER, RedirectorConfig } from '@open-amt-cloud-toolkit/ui-toolkit/core'
import React, { useRef, useEffect, useState } from 'react'

export interface IDERProps {
    iderState: number
    updateIderState: (newState: number) => void
    iderData: IDERData | null
    cdrom: File | null
    floppy: File | null
    mpsServer: string | null
    authToken?: string
    deviceId: string | null
    'data-testid'?: string
}

export interface IDERData {
    floppyRead: number
    floppyWrite: number
    cdromRead: number
    cdromWrite: number
}

export const IDER = ({
    iderState,
    updateIderState,
    cdrom,
    floppy,
    mpsServer,
    authToken,
    deviceId
}: IDERProps): React.ReactElement | null => {
    const [currentIderState, setCurrentIderState] = useState(0)
    const redirectorRef = useRef<AMTRedirector | null>(null)
    const iderRef = useRef<AMTIDER | null>(null)

    useEffect(() => {
        // Initialize the redirector on mount
        const server: string = mpsServer != null ? mpsServer.replace('http', 'ws') : ''
        const config: RedirectorConfig = {
            mode: 'ider',
            protocol: Protocol.IDER,
            fr: new FileReader(),
            host: deviceId != null ? deviceId : '',
            port: 16994,
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
    }, [mpsServer, deviceId, authToken])

    // React to changes in iderState prop
    useEffect(() => {
        if (iderState === 1 && currentIderState === 0) {
            startIder()
        } else if (iderState === 0 && currentIderState === 1) {
            stopIder()
        }
    }, [iderState])

    const onConnectionStateChange = (redirector: AMTRedirector, state: number): void => {
        setCurrentIderState(state)
    }

    const startIder = (): void => {
        updateIderState(1)
        if (redirectorRef.current) {
            iderRef.current = new AMTIDER(redirectorRef.current, cdrom, null)
            redirectorRef.current.onNewState = iderRef.current.stateChange.bind(iderRef.current)
            redirectorRef.current.onProcessData = iderRef.current.processData.bind(iderRef.current)
            iderRef.current.sectorStats = iderSectorStats
            redirectorRef.current.onStateChanged = onConnectionStateChange
            redirectorRef.current.start(WebSocket)
        }
    }

    const stopIder = (): void => {
        updateIderState(0)
        if (redirectorRef.current) {
            redirectorRef.current.stop()
            cleanup()
        }
    }

    const cleanup = (): void => {
        redirectorRef.current = null
        iderRef.current = null
    }

    const iderSectorStats = (mode: number, dev: number, total: number, start: number, len: number): void => {
        if (!iderRef.current) return
        if (mode === 1) { // Read operation
            if (dev === 0) { // Floppy
                iderRef.current.floppyRead += len * 512
            } else { // CD-ROM
                iderRef.current.cdromRead += len * 2048
            }
        } else { // Write operation
            if (dev === 0) { // Floppy
                iderRef.current.floppyWrite += len * 512
            } else { // CD-ROM
                iderRef.current.cdromWrite += len * 2048
            }
        }
    }

    // This component doesn't render anything
    return null
}