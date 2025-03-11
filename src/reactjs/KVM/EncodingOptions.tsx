/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import React, { useState } from 'react'
import './EncodingOptions.scss'

export interface IEncodingOptions {
  changeEncoding: (encoding: number) => void
  getConnectState: () => number
}

export const EncodingOptions = ({ changeEncoding, getConnectState }: IEncodingOptions): React.ReactElement => {
  const [value, setValue] = useState(1)

  const onEncodingChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newValue = parseInt(e.target.value)
    setValue(newValue)
    changeEncoding(newValue)
  }

  return (
    <span className="encoding">
      <label>Encoding:</label>
      <select 
        value={value} 
        className={getConnectState() === 2 ? 'reldisabled' : ''} 
        onChange={onEncodingChange} 
        disabled={getConnectState() === 2}
      >
        <option value="1">RLE 8</option>
        <option value="2">RLE 16</option>
      </select>
    </span>
  )
}