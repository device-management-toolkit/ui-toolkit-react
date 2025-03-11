/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Sol } from './Sol'
import i18n from '../../i18n'
// Get browser language
i18n.changeLanguage(navigator.language).catch(() => console.info('error occurred'))

const url = new URL(window.location.href)
const params = new URLSearchParams(url.search)

const rootElement = document.getElementById('sol')
if (rootElement != null) {
  const root = createRoot(rootElement)
  root.render(
    <Sol 
      deviceId={params.get('deviceId')} 
      authToken="authToken" 
      mpsServer={params.get('mpsServer')} 
    />
  )
}
