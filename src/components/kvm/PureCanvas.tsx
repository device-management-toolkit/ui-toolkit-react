/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 * Author : Ramu Bachala
 **********************************************************************/

/**
 * PureCanvas Component
 *
 * Memoized HTML5 canvas component for rendering the remote desktop.
 *
 * Handles:
 * - Canvas context initialization
 * - Mouse event forwarding (down, up, move)
 * - Right-click context menu prevention
 */

import React, { useRef, useEffect, memo } from 'react'

// Default styles for the canvas element
const DEFAULT_CANVAS_STYLES: React.CSSProperties = {
  display: 'block',
  margin: '0 auto',
  border: '1px solid #ccc',
  cursor: 'default',
  maxWidth: '100%',
  height: 'auto'
}

// Helper function to get canvas styles with width/height applied
const getCanvasStyles = (
  style: React.CSSProperties | undefined,
  canvasWidth: string,
  canvasHeight: string
): React.CSSProperties => ({
  ...(style ?? DEFAULT_CANVAS_STYLES),
  width: canvasWidth,
  height: canvasHeight
})

// Props for the PureCanvas component
export interface PureCanvasProps {
  contextRef: (ctx: CanvasRenderingContext2D) => void // Callback to receive canvas 2D context
  mouseDown: (event: React.MouseEvent) => void // Mouse button press handler
  mouseUp: (event: React.MouseEvent) => void // Mouse button release handler
  mouseMove: (event: React.MouseEvent) => void // Mouse movement handler
  canvasHeight: string // Canvas display height (CSS value, e.g., '480px')
  canvasWidth: string // Canvas display width (CSS value, e.g., '100%')
  className?: string // Custom CSS class for canvas
  style?: React.CSSProperties // Custom inline styles for canvas
}

export const PureCanvas: React.FC<PureCanvasProps> = memo(
  ({
    contextRef,
    mouseDown,
    mouseUp,
    mouseMove,
    canvasHeight,
    canvasWidth,
    className,
    style
  }) => {
    // Ref to the canvas DOM element
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Initialize canvas context on mount and pass to parent via callback
    useEffect(() => {
      const canvas = canvasRef.current
      if (canvas?.getContext !== undefined) {
        try {
          const ctx = canvas.getContext('2d')
          if (ctx !== null) {
            contextRef(ctx)
          }
        } catch {
          // Handle error silently
        }
      }
    }, [contextRef])

    // Prevents right-click context menu from appearing on the canvas
    const handleContextMenu = (e: React.MouseEvent): boolean => {
      e.preventDefault()
      return false
    }

    return (
      <canvas
        ref={canvasRef}
        width={1366}
        height={768}
        onContextMenu={handleContextMenu}
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        onMouseMove={mouseMove}
        data-testid='pure-canvas-testid'
        className={className}
        style={getCanvasStyles(style, canvasWidth, canvasHeight)}
      />
    )
  }
)

PureCanvas.displayName = 'PureCanvas'
