/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

// Mock for react-i18next

export const useTranslation = () => ({
  t: (key: string) => key,
  i18n: {
    changeLanguage: jest.fn(),
    language: 'en'
  }
})

export const initReactI18next = {
  type: '3rdParty',
  init: jest.fn()
}
