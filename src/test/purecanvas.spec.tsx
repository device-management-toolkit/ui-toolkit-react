/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import React from 'react'
import { PureCanvas, PureCanvasProps } from '../reactjs/KVM/PureCanvas'
import { shallow } from 'enzyme'
import { any } from 'prop-types'

const testprops: PureCanvasProps = {
  contextRef: (ctx: CanvasRenderingContext2D) => {},
  mouseDown: (event: React.MouseEvent) => {},
  mouseUp: (event: React.MouseEvent) => {},
  mouseMove: (event: React.MouseEvent) => {},
  canvasHeight: ('768'),
  canvasWidth: ('1366')
}

describe('Testing purecanvas component rendering', () => {
  it('renders without crashing', () => {
    shallow(<PureCanvas {...testprops} />)
  })
})

describe('Testing purecanvas component update', () => {
  it('component update should return false', () => {
    const wrapper: any = shallow(<PureCanvas {...testprops} />)
    const result = wrapper.instance()?.shouldComponentUpdate(any, any, any)
    expect(result).toBe(false)
  })
})

describe('Testing render method', () => {
  it('render() width testing', () => {
    const wrapper = shallow(<PureCanvas {...testprops} />)
    expect(wrapper.prop('width')).toBe('1366')
  })
})

describe('Testing render method', () => {
  it('render() height testing', () => {
    const wrapper = shallow(<PureCanvas {...testprops} />)
    expect(wrapper.prop('height')).toBe('768')
  })
})

//
describe('Test PureCanvas', () => {
  it('Test render() in PureCanvas', () => {
    // Initialization of PureCanvasProps
    const purecanvasprops: PureCanvasProps = {
      contextRef: (ctx: CanvasRenderingContext2D) => {},
      mouseDown: (event: React.MouseEvent) => {},
      mouseUp: (event: React.MouseEvent) => {},
      mouseMove: (event: React.MouseEvent) => {},
      canvasHeight: ('700'),
      canvasWidth: ('300')
    }
    let myValue = 0
    const myEvent = {
      preventDefault () { myValue = 1 }
    }

    // test render and simulate event
    const pc = shallow(<PureCanvas {...purecanvasprops} />)
    pc.simulate('contextmenu', myEvent)

    // Output
    expect(pc.prop('onMouseDown')).toBe(purecanvasprops.mouseDown)
    expect(pc.prop('onMouseUp')).toBe(purecanvasprops.mouseUp)
    expect(pc.prop('onMouseMove')).toBe(purecanvasprops.mouseMove)
    expect(pc.prop('width')).toBe('1366')
    expect(pc.prop('height')).toBe('768')
    expect(myValue).toBe(1)
    expect(pc).toMatchSnapshot()
    console.log(pc.debug())
    console.log(pc.props())
  })
})
