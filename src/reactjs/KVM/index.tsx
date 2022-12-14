/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React from 'react'
import { createRoot } from 'react-dom/client'
import { KVM } from './UI'
import i18n from '../../i18n'
// Get browser language
i18n.changeLanguage(navigator.language).catch(() => console.info('error occurred'))

const url = new URL(window.location.href)
const params = new URLSearchParams(url.search)
const rootElement = document.querySelector('#kvm')
if (rootElement != null){
  const root = createRoot(rootElement)
  root.render(<KVM autoConnect={false} deviceId={params.get('deviceId')} mpsServer={params.get('mpsServer') + '/relay'} authToken="authToken" mouseDebounceTime={200} canvasHeight={'100%'} canvasWidth={'100%'} />)
}
