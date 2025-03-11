/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 * Author : Ramu Bachala
 **********************************************************************/
import React, { useRef, useEffect } from 'react'
import './PureCanvas.scss'

export interface PureCanvasProps {
  contextRef: (ctx: CanvasRenderingContext2D) => void
  mouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void
  mouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void
  mouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void
  canvasHeight: string
  canvasWidth: string
}

export const PureCanvas = ({ 
  contextRef, 
  mouseDown, 
  mouseUp, 
  mouseMove 
}: PureCanvasProps): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        contextRef(context)
      }
    }
  }, [contextRef])

  const canvasAttributes: React.CanvasHTMLAttributes<HTMLCanvasElement> = {
    width: '1366',
    height: '768',
    onContextMenu: (e) => { e.preventDefault(); return false },
    onMouseDown: mouseDown,
    onMouseUp: mouseUp,
    onMouseMove: mouseMove
  }

  return (
    <canvas 
      {...canvasAttributes} 
      data-testid="pure-canvas-testid" 
      className="canvas" 
      ref={canvasRef}
    />
  )
}