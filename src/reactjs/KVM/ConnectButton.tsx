/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/
import React from 'react'
import './ConnectButton.scss'

export interface ConnectProps {
  kvmstate: number
  handleConnectClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const ConnectButton = ({ kvmstate, handleConnectClick }: ConnectProps): React.ReactElement => {
  return (
    <button className="button" onClick={handleConnectClick}>
      {kvmstate === 1 ? 'Connecting KVM' : (kvmstate === 2 ? 'Disconnect KVM' : 'Connect KVM')}
    </button>
  )
}