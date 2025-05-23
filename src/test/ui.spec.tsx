/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import React from 'react'
import { KVM, KVMProps } from '../reactjs/KVM/UI'
import { render, screen } from '@testing-library/react'

class MockFileReader {
  onload: jest.Mock
  onerror: jest.Mock
  readAsArrayBuffer: jest.Mock
  readAsBinaryString: jest.Mock
  readAsDataURL: jest.Mock
  readAsText: jest.Mock
  abort: jest.Mock

  constructor() {
    this.onload = jest.fn()
    this.onerror = jest.fn()
    this.readAsArrayBuffer = jest.fn()
    this.readAsBinaryString = jest.fn()
    this.readAsDataURL = jest.fn()
    this.readAsText = jest.fn()
    this.abort = jest.fn()
  }
}

(global as any).FileReader = MockFileReader

// Mock WebSocket
class MockWebSocket {
  onopen: jest.Mock
  onclose: jest.Mock
  onmessage: jest.Mock
  onerror: jest.Mock
  close: jest.Mock
  send: jest.Mock

  constructor() {
    this.onopen = jest.fn()
    this.onclose = jest.fn()
    this.onmessage = jest.fn()
    this.onerror = jest.fn()
    this.close = jest.fn()
    this.send = jest.fn()
  }
}

(global as any).WebSocket = MockWebSocket;

jest.mock('../reactjs/KVM/PureCanvas', () => {
  return {
    PureCanvas: ({ contextRef, mouseMove, mouseDown, mouseUp }: any) => {
      const mockCtx = {
        canvas: {
          width: 800,
          height: 600
        },
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        drawImage: jest.fn(),
        putImageData: jest.fn(),
        getImageData: jest.fn(() => ({
          data: new Uint8ClampedArray(10),
        })),
        createImageData: jest.fn()
      };
      
      React.useEffect(() => {
        if (contextRef) {
          contextRef(mockCtx)
        }
      }, [contextRef])
      
      return <canvas data-testid="pure-canvas-testid" />
    }
  }
})

// Mock AMT Desktop and other dependencies
jest.mock('@open-amt-cloud-toolkit/ui-toolkit/core', () => {
  return {
    AMTDesktop: jest.fn().mockImplementation(() => ({
      processData: jest.fn(),
      start: jest.fn(),
      onStateChange: jest.fn(),
      onSendKvmData: jest.fn(),
      state: 0,
      bpp: 1
    })),
    AMTKvmDataRedirector: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    })),
    DataProcessor: jest.fn().mockImplementation(() => ({
      processData: jest.fn()
    })),
    MouseHelper: jest.fn().mockImplementation(() => ({
      mousemove: jest.fn(),
      mousedown: jest.fn(),
      mouseup: jest.fn()
    })),
    KeyBoardHelper: jest.fn().mockImplementation(() => ({
      GrabKeyInput: jest.fn(),
      UnGrabKeyInput: jest.fn()
    })),
    Protocol: { KVM: 1 }
  }
})

describe('KVM Component', () => {
  let props: KVMProps;

  beforeEach(() => {
    props = {
      deviceId: '1234',
      mpsServer: 'wss://localhost/mps',
      mouseDebounceTime: 200,
      canvasHeight: '600',
      canvasWidth: '400',
      autoConnect: false,
      authToken: 'authToken'
    };
    jest.useFakeTimers();
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { container } = render(<KVM {...props} />)
    expect(container).not.toBeNull()
    expect(screen.getByTestId('pure-canvas-testid')).toBeInTheDocument();
  })

  it('should render with autoConnect enabled', () => {
    render(<KVM {...props} autoConnect={true} />);
    expect(screen.getByTestId('pure-canvas-testid')).toBeInTheDocument()
  })

  describe('KVM instance methods', () => {
    let kvm: KVM
    let mockStart: jest.Mock
    let mockStop: jest.Mock
    let mockGrabKeyInput: jest.Mock
    let mockUnGrabKeyInput: jest.Mock

    beforeEach(() => {
      mockStart = jest.fn()
      mockStop = jest.fn()
      mockGrabKeyInput = jest.fn()
      mockUnGrabKeyInput = jest.fn()

      kvm = new KVM(props)
      
      kvm.setState = jest.fn((newState: any) => {
        Object.assign(kvm.state, newState)
      })
      
      kvm.redirector = {
        start: mockStart,
        stop: mockStop,
        onProcessData: jest.fn(),
        onStart: jest.fn(),
        onNewState: jest.fn(),
        onSendKvmData: jest.fn(),
        onStateChanged: jest.fn(),
        onError: jest.fn(),
        send: jest.fn()
      };
      
      kvm.keyboard = {
        GrabKeyInput: mockGrabKeyInput,
        UnGrabKeyInput: mockUnGrabKeyInput
      }
      
      kvm.module = {
        processData: jest.fn(),
        start: jest.fn(),
        onStateChange: jest.fn(),
        onSendKvmData: jest.fn(),
        state: 0,
        bpp: 1,
        onSend: jest.fn(),
        onProcessData: jest.fn()
      }
      
      // Set up ctx mock to avoid null reference errors
      kvm.ctx = {
        canvas: {
          width: 800,
          height: 600
        },
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        drawImage: jest.fn(),
        putImageData: jest.fn(),
        getImageData: jest.fn(),
        createImageData: jest.fn()
      } as unknown as CanvasRenderingContext2D;
      
      kvm.cleanUp = jest.fn()
      kvm.init = jest.fn()
    })

    it('should start KVM when handleConnectClick is called in disconnected state', () => {
      kvm.state = { kvmstate: 0, encodingOption: 1 }
      
      kvm.handleConnectClick({ persist: jest.fn() })
      
      expect(mockStart).toHaveBeenCalledTimes(1)
      expect(mockStart).toHaveBeenCalledWith(MockWebSocket)
      expect(mockGrabKeyInput).toHaveBeenCalledTimes(1)
      expect(mockStop).not.toHaveBeenCalled()
      expect(mockUnGrabKeyInput).not.toHaveBeenCalled()
    })

    it('should stop KVM when handleConnectClick is called in connected state', () => {
      kvm.state = { kvmstate: 2, encodingOption: 1 }
      
      kvm.handleConnectClick({ persist: jest.fn() })
      
      expect(mockStop).toHaveBeenCalledTimes(1)
      expect(mockUnGrabKeyInput).toHaveBeenCalledTimes(1)
      expect(kvm.cleanUp).toHaveBeenCalledTimes(1)
      expect(kvm.init).toHaveBeenCalledTimes(1)
    })

    it('should change desktop settings correctly in disconnected state', () => {
      kvm.state = { kvmstate: 0, encodingOption: 1 }
      
      kvm.changeDesktopSettings({ encoding: 5 })
      
      expect(kvm.state.encodingOption).toBe(5)
      expect(kvm.module.bpp).toBe(5);
      expect(kvm.desktopSettingsChange).toBe(false)
    })

    it('should change desktop settings and restart KVM in connected state', () => {
      kvm.state = { kvmstate: 2, encodingOption: 1 }
      
      kvm.changeDesktopSettings({ encoding: 7 })
      
      expect(kvm.desktopSettingsChange).toBe(true)
      expect(kvm.module.bpp).toBe(7)
      expect(mockStop).toHaveBeenCalledTimes(1)
    })

    it('should handle connection state changes', () => {
      kvm.OnConnectionStateChange({}, 3)
      
      expect(kvm.state.kvmstate).toBe(3)
    })

    it('should restart KVM after desktop settings change and connection state changes to 0', () => {
      kvm.desktopSettingsChange = true
      
      kvm.OnConnectionStateChange({}, 0)
      
      expect(kvm.state.kvmstate).toBe(0)
      expect(kvm.desktopSettingsChange).toBe(false)
      
      jest.advanceTimersByTime(2000)
      
      expect(mockStart).toHaveBeenCalledTimes(1)
    })

    it('should reset when redirector error occurs', () => {
      kvm.onRedirectorError()
      
      expect(kvm.cleanUp).toHaveBeenCalledTimes(1)
      expect(kvm.init).toHaveBeenCalledTimes(1)
    })

    it('should clean up and reinitialize when device ID changes', () => {
      kvm.componentDidUpdate({ deviceId: 'different-id' })
      
      expect(mockStop).toHaveBeenCalledTimes(1)
      expect(mockUnGrabKeyInput).toHaveBeenCalledTimes(1)
      expect(kvm.cleanUp).toHaveBeenCalledTimes(1)
      expect(kvm.init).toHaveBeenCalledTimes(1)
    })

    it('should return the correct render status', () => {
      kvm.module.state = 2
      
      expect(kvm.getRenderStatus()).toBe(2)
    })

    it('should handle saveContext and initialize', () => {
      const freshKvm = new KVM(props)
      
      const initSpy = jest.spyOn(freshKvm, 'init').mockImplementation(() => {})
      
      const mockContext = {} as CanvasRenderingContext2D
      
      freshKvm.saveContext(mockContext)
      
      expect(freshKvm.ctx).toBe(mockContext)
      expect(initSpy).toHaveBeenCalledTimes(1)
    })

    it('should properly clean up resources', () => {
      const cleanKvm = new KVM(props)
      
      cleanKvm.module = {
        bpp: 1,
        state: 0
      } as any
      
      cleanKvm.redirector = {} as any
      cleanKvm.dataProcessor = {} as any
      cleanKvm.mouseHelper = {} as any
      cleanKvm.keyboard = {} as any
      
      // Set up the ctx mock
      const clearRectMock = jest.fn()
      cleanKvm.ctx = {
        canvas: {
          width: 800,
          height: 600
        },
        clearRect: clearRectMock
      } as unknown as CanvasRenderingContext2D
      
      cleanKvm.cleanUp()
      
      expect(cleanKvm.module).toBeNull()
      expect(cleanKvm.redirector).toBeNull()
      expect(cleanKvm.dataProcessor).toBeNull()
      expect(cleanKvm.mouseHelper).toBeNull()
      expect(cleanKvm.keyboard).toBeNull()
      expect(clearRectMock).toHaveBeenCalledWith(0, 0, 600, 800)
    })
  })
})