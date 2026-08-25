/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { vi } from 'vitest'

// Mock for react-i18next

export const useTranslation = () => ({
  t: (key: string) => key,
  i18n: {
    changeLanguage: vi.fn(),
    language: 'en'
  }
})

export const initReactI18next = {
  type: '3rdParty',
  init: vi.fn()
}
