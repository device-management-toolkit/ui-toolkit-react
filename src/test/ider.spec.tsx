/*********************************************************************
* Copyright (c) Intel Corporation 2023
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React from 'react'
import { IDER } from '../reactjs/IDER/ider'
import { AMTRedirector } from '@device-management-toolkit/ui-toolkit/core'
import { render } from '@testing-library/react'

// Mocks for external dependencies
jest.mock('@device-management-toolkit/ui-toolkit/core', () => ({
    AMTRedirector: jest.fn(),
    AMTIDER: jest.fn(),
    Protocol: { IDER: 'IDER' },
}))
describe('IDER Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()
    })
    const props = {
        mpsServer: 'http://example.com',
        deviceId: 'device123',
        authToken: 'token123',
        iderState: 0,
        updateIderState: jest.fn(),
        iderData: null,
        cdrom: new File([''], 'cdrom.iso', { type: 'application/octet-stream' }),
        floppy: null
    }

    it('should initialize and clean up redirector', () => {
        const { unmount } = render(<IDER {...props} />)
        console.log(AMTRedirector)
        expect(AMTRedirector).toHaveBeenCalledWith(expect.anything())
        unmount()
    })
    it('renders no visible content', () => {
        const { container } = render(<IDER {...props} />)
        expect(container).toBeEmptyDOMElement()
    })
})



