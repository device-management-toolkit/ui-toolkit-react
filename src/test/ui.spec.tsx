/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import React from 'react'
import { KVM, KVMProps } from '../reactjs/KVM/UI'
import { render } from '@testing-library/react'
import resetAllMocks = jest.resetAllMocks
import { act } from 'react'

let props: KVMProps
beforeEach(() => {
  props = {
    deviceId: '1234',
    mpsServer: 'wss://localhost/mps',
    mouseDebounceTime: 10,
    canvasHeight: '600',
    canvasWidth: '400',
    autoConnect: false,
    authToken: 'authToken'
  }
})

describe('Testing purely KVM UI', () => {
  it('should render successfully', () => {
    const container = render(<KVM {...props} />)
    expect(container).not.toBeNull()
  })
})

describe('Testing KVM component methods', () => {
  let kvm: KVM
  beforeEach(() => {
    resetAllMocks()
    jest.useFakeTimers()
    kvm = new KVM(props)
    kvm.setState = jest.fn((newState: any) => {
      Object.assign(kvm.state, kvm.state, newState)
    })
    kvm.redirector = {
      start: jest.fn(),
      stop: jest.fn()
    }
    kvm.keyboard = {
      GrabKeyInput: jest.fn(),
      UnGrabKeyInput: jest.fn()
    }
    kvm.cleanUp = jest.fn()
    kvm.init = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should handle state changes', async () => {
    expect(kvm.state.kvmstate).toEqual(0)
    kvm.handleConnectClick({ persist: jest.fn() })
    expect(kvm.redirector.start).toHaveBeenCalledTimes(1)
    expect(kvm.redirector.stop).toHaveBeenCalledTimes(0)
    expect(kvm.keyboard.GrabKeyInput).toHaveBeenCalledTimes(1)
    expect(kvm.keyboard.UnGrabKeyInput).toHaveBeenCalledTimes(0)
    expect(kvm.cleanUp).toHaveBeenCalledTimes(0)
    expect(kvm.init).toHaveBeenCalledTimes(0)

    // nothing really happens on 1
    kvm.OnConnectionStateChange({}, 1)
    expect(kvm.state.kvmstate).toEqual(1)
    kvm.handleConnectClick({ persist: jest.fn() })
    expect(kvm.redirector.start).toHaveBeenCalledTimes(1)
    expect(kvm.redirector.stop).toHaveBeenCalledTimes(0)
    expect(kvm.keyboard.GrabKeyInput).toHaveBeenCalledTimes(1)
    expect(kvm.keyboard.UnGrabKeyInput).toHaveBeenCalledTimes(0)
    expect(kvm.cleanUp).toHaveBeenCalledTimes(0)
    expect(kvm.init).toHaveBeenCalledTimes(0)

    kvm.OnConnectionStateChange({}, 2)
    expect(kvm.state.kvmstate).toEqual(2)
    kvm.handleConnectClick({ persist: jest.fn() })
    expect(kvm.redirector.start).toHaveBeenCalledTimes(1)
    expect(kvm.redirector.stop).toHaveBeenCalledTimes(1)
    expect(kvm.keyboard.GrabKeyInput).toHaveBeenCalledTimes(1)
    expect(kvm.keyboard.UnGrabKeyInput).toHaveBeenCalledTimes(1)
    expect(kvm.cleanUp).toHaveBeenCalledTimes(1)
    expect(kvm.init).toHaveBeenCalledTimes(1)

    expect(kvm.desktopSettingsChange).toBeFalsy()
    kvm.desktopSettingsChange = true
    kvm.OnConnectionStateChange({}, 0)
    expect(kvm.state.kvmstate).toEqual(0)
    await act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(kvm.redirector.start).toHaveBeenCalledTimes(1)
    await act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(kvm.redirector.start).toHaveBeenCalledTimes(2)
    expect(kvm.redirector.stop).toHaveBeenCalledTimes(1)
    expect(kvm.keyboard.GrabKeyInput).toHaveBeenCalledTimes(2)
    expect(kvm.keyboard.UnGrabKeyInput).toHaveBeenCalledTimes(1)
  })

  it('should stop on redirection error', () => {
    kvm.onRedirectorError()
    expect(kvm.cleanUp).toHaveBeenCalledTimes(1)
    expect(kvm.init).toHaveBeenCalledTimes(1)
  })

  it('should stop on component update with different device id', () => {
    kvm.componentDidUpdate({ deviceId: 5678 })
    expect(kvm.cleanUp).toHaveBeenCalledTimes(1)
    expect(kvm.init).toHaveBeenCalledTimes(1)
  })

  it('should handle changing desktop settings', () => {
    kvm.module = {
      bpp: 1
    }

    // default state
    expect(kvm.state.kvmstate).toEqual(0)
    expect(kvm.state.encodingOption).toEqual(1)

    kvm.changeDesktopSettings({ encoding: 5 })
    expect(kvm.desktopSettingsChange).toBeFalsy()
    expect(kvm.state.encodingOption).toEqual(5)
    expect(kvm.module.bpp).toEqual(5)

    kvm.setState({ kvmstate: 2 })
    kvm.changeDesktopSettings({ encoding: 7 })
    expect(kvm.desktopSettingsChange).toBeTruthy()
    expect(kvm.state.encodingOption).toEqual(5)
    expect(kvm.module.bpp).toEqual(7)
    expect(kvm.cleanUp).toHaveBeenCalledTimes(1)
    expect(kvm.init).toHaveBeenCalledTimes(1)
  })

  it('should return module state when queried', () => {
    kvm.module = {
      state: 2
    }
    expect(kvm.getRenderStatus()).toEqual(2)
  })
})
