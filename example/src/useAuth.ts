/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { useState } from 'react'

export type ApiMode = 'legacy' | 'redfish'

interface AuthState {
  token: string
  deviceId: string
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
    deviceId: '',
    isAuthenticated: false,
    isLoading: false,
    error: ''
  })

  const connect = async (config: AuthConfig, apiMode: ApiMode) => {
    const { mpsServer, deviceId, username, password } = config

    const missingRequiredFields =
      !username ||
      !password ||
      !mpsServer ||
      (apiMode === 'legacy' && !deviceId)

    if (missingRequiredFields) {
      setState((s) => ({ ...s, error: 'Please fill in all required fields' }))
      return
    }

    setState((s) => ({ ...s, isLoading: true, error: '' }))

    try {
      const baseUrl = ensureNoTrailingSlash(mpsServer)
      if (!/^https?:\/\//.test(baseUrl)) {
        throw new Error('Server URL must start with http:// or https://')
      }

      if (apiMode === 'legacy') {
        // Support both deployment styles by trying both legacy auth paths.
        const authPaths = ['/api/v1/authorize', '/mps/login/api/v1/authorize']
        let authBody: { token?: string; accessToken?: string } | null = null
        let authPathUsed = ''
        let authError = 'Authentication failed'

        for (const authPath of authPaths) {
          const authRes = await fetch(`${baseUrl}${authPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          })

          if (!authRes.ok) {
            authError = `Authentication failed: ${authRes.status} ${authRes.statusText}`
            continue
          }

          const contentType = authRes.headers.get('content-type') ?? ''
          if (!contentType.includes('application/json')) {
            authError = `Authentication endpoint returned non-JSON response at ${authPath}`
            continue
          }

          authBody = (await authRes.json()) as {
            token?: string
            accessToken?: string
          }
          authPathUsed = authPath
          break
        }

        if (!authBody) {
          throw new Error(authError)
        }

        const accessToken = authBody.token ?? authBody.accessToken

        if (!accessToken) {
          throw new Error('No token received')
        }

        const redirRes = await fetch(
          `${baseUrl}${authPathUsed}/redirection/${encodeURIComponent(deviceId.trim())}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        )

        if (!redirRes.ok) {
          throw new Error(
            `Redirection failed: ${redirRes.status} ${redirRes.statusText}`
          )
        }

        const redirBody = (await redirRes.json()) as {
          token?: string
          RedirectionToken?: string
          Token?: string
        }
        const token = redirBody.token ?? redirBody.RedirectionToken ?? redirBody.Token
        if (!token) {
          throw new Error('No redirection token received')
        }

        setState({
          token,
          deviceId: deviceId.trim(),
          isAuthenticated: true,
          isLoading: false,
          error: ''
        })
      } else {
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
          deviceId: systemBody.Id ?? parseSystemIdFromPath(systemPath),
          isAuthenticated: true,
          isLoading: false,
          error: ''
        })
      }
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
      deviceId: '',
      isAuthenticated: false,
      isLoading: false,
      error: ''
    })
  }

  return { ...state, connect, disconnect }
}
