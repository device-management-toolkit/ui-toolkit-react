/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom'

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: [] })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  canvas: {
    height: 768,
    width: 1366
  }
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock WebSocket
const WebSocketMock = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
})) as jest.Mock & {
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
const FileReaderMock = jest.fn().mockImplementation(() => ({
  readAsArrayBuffer: jest.fn(),
  readAsText: jest.fn(),
  result: null,
  onload: null,
  onerror: null
})) as jest.Mock & {
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
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('')
  },
  writable: true
})
