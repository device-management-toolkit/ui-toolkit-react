/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Initialize i18n
import { i18n } from '@device-management-toolkit/ui-toolkit-react'

// Set default language
i18n.changeLanguage('en')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
