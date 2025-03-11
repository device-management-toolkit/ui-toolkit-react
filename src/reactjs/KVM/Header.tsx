/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import React from 'react'
import { ConnectButton } from './ConnectButton'
import { DesktopSettings } from './DesktopSettings'
import './Header.scss'

export interface IHeaderProps {
  kvmstate: number
  deviceId: string | null
  server: string | null
  handleConnectClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  changeDesktopSettings: (settings: any) => void
  getConnectState: () => number
}

export const Header = ({ 
  kvmstate, 
  handleConnectClick, 
  changeDesktopSettings, 
  getConnectState 
}: IHeaderProps): React.ReactElement => {
  return (
    <>
      <div className="header">
        <ConnectButton
          handleConnectClick={handleConnectClick}
          kvmstate={kvmstate}
        />
        <DesktopSettings
          changeDesktopSettings={changeDesktopSettings}
          getConnectState={getConnectState}
        />
      </div>
    </>
  )
}