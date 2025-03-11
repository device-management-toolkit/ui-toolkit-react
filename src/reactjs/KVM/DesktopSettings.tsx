/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import React, { useState } from 'react'
import { EncodingOptions } from './EncodingOptions'

export interface IDesktopSettings {
  changeDesktopSettings: (settings: any) => void
  getConnectState: () => number
}

export const DesktopSettings = ({ changeDesktopSettings, getConnectState }: IDesktopSettings): React.ReactElement => {
  const [desktopSettings] = useState({
    encoding: 1
  })

  const changeEncoding = (encoding: number): void => {
    desktopSettings.encoding = encoding
    changeDesktopSettings(desktopSettings)
  }

  return (
    <EncodingOptions changeEncoding={changeEncoding} getConnectState={getConnectState} />
  )
}
