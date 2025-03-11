/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import React, { useEffect, useRef } from 'react'
import Style from 'styled-components'

const TerminalContainer = Style.div`
   display: block;
   text-align: center;
`

const XTerm = Style.div`
   display: inline-block;
`

export interface IPropTerminal {
  handleKeyPress: (data: string) => void
  xterm: any
  handleKeyDownPress: (e: any) => void
}

const Term = ({ xterm, handleKeyPress }: IPropTerminal): React.ReactElement => {
  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current) {
      return
    }
    mountedRef.current = true

    const element = document.getElementById('xterm')
    if (element && xterm) {
      xterm.open(element)
      xterm.onData(data => handleKeyPress(data))
      
      xterm.attachCustomKeyEventHandler(e => {
        e.stopPropagation()
        e.preventDefault()
        
        if (e.ctrlKey && e.shiftKey === false && e.keyCode === 67) {
          return navigator.clipboard.writeText(xterm.getSelection())
        } else if (e.ctrlKey && e.shiftKey === false && e.keyCode === 86) {
          return navigator.clipboard.readText()
            .then(text => handleKeyPress(text))
        } else if (e.code === 'Space') {
          return handleKeyPress(e.key)
        }
      })
    }
  }, [xterm, handleKeyPress])

  return (
    <div className="terminal">
      <div className="terminal_xterm" id="xterm" />
    </div>
  )
}

export default Term