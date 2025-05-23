/*********************************************************************
* Copyright (c) Intel Corporation 2023
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { AMTRedirector, Protocol, AMTIDER, RedirectorConfig } from '@device-management-toolkit/ui-toolkit/core'
import React from 'react'

export interface IDERProps {
    iderState: number
    updateIderState: (newState: number) => void
    iderData: IDERData | null
    cdrom: File | null
    floppy: File | null
    mpsServer: string | null
    authToken?: string
    deviceId: string | null
}

export interface IDERState {
    iderState: number
    iderData: IDERData | null
}

export interface IDERData {
    floppyRead: number
    floppyWrite: number
    cdromRead: number
    cdromWrite: number
}

export class IDER extends React.Component<IDERProps, IDERState> {
    redirector: AMTRedirector | null = null
    ider: AMTIDER | null = null

    constructor(props: IDERProps) {
        super(props)
        this.state = {
            iderState: 0,
            iderData: null,
        }
    }

    componentDidMount(): void {
        const server: string = this.props.mpsServer != null ? this.props.mpsServer.replace('http', 'ws') : ''
        const config: RedirectorConfig = {
            mode: 'ider',
            protocol: Protocol.IDER,
            fr: new FileReader(),
            host: this.props.deviceId != null ? this.props.deviceId : '',
            port: 16994,
            user: '',
            pass: '',
            tls: 0,
            tls1only: 0,
            authToken: this.props.authToken != null ? this.props.authToken : '',
            server: server
        }
        this.redirector = new AMTRedirector(config)
    }

    componentWillUnmount(): void {
        this.cleanup()
    }

    onConnectionStateChange = (redirector, state: number): void => this.setState({ iderState: state })

    componentDidUpdate(prevProps) {
        // React to changes in props, specifically iderState
        if (this.props.iderState !== prevProps.iderState) {
            if (this.props.iderState === 1) {
              this.startIder()
            } else {
              this.stopIder()
            }
          }
    }

    startIder = (): void => {
        this.props.updateIderState(1)
        if (this.redirector) {
            this.ider = new AMTIDER(this.redirector, this.props.cdrom, null)
            this.redirector.onNewState = this.ider.stateChange.bind(this.ider)
            this.redirector.onProcessData = this.ider.processData.bind(this.ider)
            this.ider.sectorStats = this.iderSectorStats.bind(this)
            this.redirector.onStateChanged = this.onConnectionStateChange.bind(this)
            this.redirector.start(WebSocket)
        }
    }

    stopIder(): void {
        this.props.updateIderState(0)
        if (this.redirector) {
            this.redirector.stop()
            this.cleanup()
        }
    }

    cleanup(): void {
        this.redirector = null
        this.ider = null
    }

    iderSectorStats(mode, dev, total, start, len): void {
        if (!this.ider) return
        if (mode === 1) { // Read operation
            if (dev === 0) { // Floppy
                this.ider.floppyRead += len * 512;
            } else { // CD-ROM
                this.ider.cdromRead += len * 2048;
            }
        } else { // Write operation
            if (dev === 0) { // Floppy
                this.ider.floppyWrite += len * 512;
            } else { // CD-ROM
                this.ider.cdromWrite += len * 2048;
            }
        }
    }

    render() {
        return null
    }
}


