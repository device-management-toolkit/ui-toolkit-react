/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { useState } from 'react'

interface AuthState {
  token: string
  systemId: string
  isAuthenticated: boolean
  isLoading: boolean
  error: string
}

interface AuthConfig {
  mpsServer: string
  deviceId: string
  username: string
  password: string
}

interface RedfishSystem {
  Id?: string
  Actions?: {
    Oem?: {
      '#IntelComputerSystem.GenerateRedirectionToken'?: {
        target?: string
      }
    }
  }
}

interface RedfishMembersResponse {
  Members?: Array<{
    '@odata.id'?: string
  }>
}

const ensureNoTrailingSlash = (url: string): string => url.replace(/\/+$/, '')

const toAbsoluteUrl = (baseUrl: string, pathOrUrl: string): string => {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  if (pathOrUrl.startsWith('/')) {
    return `${baseUrl}${pathOrUrl}`
  }
  return `${baseUrl}/${pathOrUrl}`
}

const getBasicAuthHeader = (username: string, password: string): string => {
  return `Basic ${btoa(`${username}:${password}`)}`
}

const getSystemPathFromInput = (deviceId: string): string => {
  if (deviceId.startsWith('/redfish/v1/Systems/')) {
    return deviceId
  }
  return `/redfish/v1/Systems/${encodeURIComponent(deviceId)}`
}

const parseSystemIdFromPath = (systemPath: string): string => {
  const trimmed = systemPath.replace(/\/+$/, '')
  const parts = trimmed.split('/')
  return decodeURIComponent(parts[parts.length - 1] ?? '')
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    token: '',
    systemId: '',
    isAuthenticated: false,
    isLoading: false,
    error: ''
  })

  const connect = async (config: AuthConfig) => {
    const { mpsServer, deviceId, username, password } = config

    if (!username || !password || !mpsServer) {
      setState((s) => ({ ...s, error: 'Please fill in all required fields' }))
      return
    }

    setState((s) => ({ ...s, isLoading: true, error: '' }))

    try {
      const baseUrl = ensureNoTrailingSlash(mpsServer)
      if (!/^https?:\/\//.test(baseUrl)) {
        throw new Error('Server URL must start with http:// or https://')
      }
      const authHeader = getBasicAuthHeader(username, password)

      let systemPath = ''
      if (deviceId.trim().length > 0) {
        systemPath = getSystemPathFromInput(deviceId.trim())
      } else {
        const systemsRes = await fetch(`${baseUrl}/redfish/v1/Systems`, {
          headers: {
            Accept: 'application/json',
            Authorization: authHeader
          }
        })
        if (!systemsRes.ok) {
          throw new Error(
            `Failed to list systems: ${systemsRes.status} ${systemsRes.statusText}`
          )
        }

        const systemsBody = (await systemsRes.json()) as RedfishMembersResponse
        const firstMember = systemsBody.Members?.[0]?.['@odata.id']
        if (!firstMember) {
          throw new Error('No systems found at /redfish/v1/Systems')
        }

        systemPath = firstMember
      }

      const systemRes = await fetch(toAbsoluteUrl(baseUrl, systemPath), {
        headers: {
          Accept: 'application/json',
          Authorization: authHeader
        }
      })
      if (!systemRes.ok) {
        throw new Error(
          `Failed to read system: ${systemRes.status} ${systemRes.statusText}`
        )
      }

      const systemBody = (await systemRes.json()) as RedfishSystem

      const actionTarget =
        systemBody.Actions?.Oem?.[
          '#IntelComputerSystem.GenerateRedirectionToken'
        ]?.target
      const fallbackActionPath = `${systemPath.replace(/\/+$/, '')}/Actions/Oem/IntelComputerSystem.GenerateRedirectionToken`
      const actionUrl = toAbsoluteUrl(baseUrl, actionTarget ?? fallbackActionPath)

      const tokenRes = await fetch(actionUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({})
      })
      if (!tokenRes.ok) {
        throw new Error(
          `Token action failed: ${tokenRes.status} ${tokenRes.statusText}`
        )
      }

      const tokenBody = (await tokenRes.json()) as {
        token?: string
        RedirectionToken?: string
        Token?: string
      }
      const token =
        tokenBody.token ?? tokenBody.RedirectionToken ?? tokenBody.Token
      if (!token) {
        throw new Error('No redirection token returned by action')
      }

      setState({
        token,
        systemId: systemBody.Id ?? parseSystemIdFromPath(systemPath),
        isAuthenticated: true,
        isLoading: false,
        error: ''
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Connection failed'
      }))
    }
  }

  const disconnect = () => {
    setState({
      token: '',
      systemId: '',
      isAuthenticated: false,
      isLoading: false,
      error: ''
    })
  }

  return { ...state, connect, disconnect }
}
