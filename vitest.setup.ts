import { vi, type Mock } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  canvas: {
    height: 768,
    width: 1366
  }
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }
})

// Mock WebSocket
const WebSocketMock = vi.fn().mockImplementation(function () {
  return {
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
}) as Mock & {
  readonly CONNECTING: 0
  readonly OPEN: 1
  readonly CLOSING: 2
  readonly CLOSED: 3
}
Object.defineProperty(WebSocketMock, 'CONNECTING', { value: 0 })
Object.defineProperty(WebSocketMock, 'OPEN', { value: 1 })
Object.defineProperty(WebSocketMock, 'CLOSING', { value: 2 })
Object.defineProperty(WebSocketMock, 'CLOSED', { value: 3 })
global.WebSocket = WebSocketMock as unknown as typeof WebSocket

// Mock FileReader
const FileReaderMock = vi.fn().mockImplementation(function () {
  return {
    readAsArrayBuffer: vi.fn(),
    readAsText: vi.fn(),
    result: null,
    onload: null,
    onerror: null
  }
}) as Mock & {
  readonly EMPTY: 0
  readonly LOADING: 1
  readonly DONE: 2
}
Object.defineProperty(FileReaderMock, 'EMPTY', { value: 0 })
Object.defineProperty(FileReaderMock, 'LOADING', { value: 1 })
Object.defineProperty(FileReaderMock, 'DONE', { value: 2 })
global.FileReader = FileReaderMock as unknown as typeof FileReader

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('')
  },
  writable: true
})
