/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import React from 'react'
import { IDesktopSettings, DesktopSettings } from '../reactjs/KVM/DesktopSettings'
import { shallow } from 'enzyme'

describe('Testing DesktopSettings', () => {
  it('Test changeEncoding() in DesktopSettings', () => {
    // Initialization of IDesktopSettings
    const desktopsettingsprops: IDesktopSettings = {
      changeDesktopSettings: (testFunc2),
      getConnectState: (testFunc1)
    }

    const ds = shallow(<DesktopSettings {...desktopsettingsprops} />)
    const myInstance = ds.instance() as DesktopSettings
    myInstance.changeEncoding(2)

    // Output
    expect(ds.prop('getConnectState')).toBe(testFunc1)
    expect(ds.prop('changeEncoding')).toBe(myInstance.changeEncoding)
    expect(myInstance.desktopsettings.encoding).toBe(2)
    expect(value1).toBe(2)
    console.log(ds.debug())
    console.log(ds.props())
  })

  it('Test render() in DesktopSettings', () => {
    // Initialization of IDesktopSettings
    const desktopsettingsprops: IDesktopSettings = {
      changeDesktopSettings: (testFunc2),
      getConnectState: (testFunc1)
    }

    const ds = shallow(<DesktopSettings {...desktopsettingsprops} />)
    const myInstance = ds.instance() as DesktopSettings
    myInstance.changeEncoding(3)

    // Output
    expect(ds.prop('getConnectState')).toBe(testFunc1)
    expect(ds.prop('changeEncoding')).toBe(myInstance.changeEncoding)
    const ret = expect(ds).toMatchSnapshot()
    console.info('ret', ret)
    expect(value1).toBe(3)
    console.log(ds.debug())
    console.log(ds.props())
  })
})

function testFunc1 (): number {
  return 1
}

class class1 {
  encoding: number
}

let value1 = 0

function testFunc2 (v: class1): void {
  value1 = v.encoding
}
