/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { useState } from 'react'

export type ApiMode = 'rest' | 'redfish'

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
  const credentials = `${username}:${password}`
  const utf8Bytes = new TextEncoder().encode(credentials)
  let binary = ''

  for (const byte of utf8Bytes) {
    binary += String.fromCharCode(byte)
  }

  return `Basic ${btoa(binary)}`
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
      !deviceId

    if (missingRequiredFields) {
      setState((s) => ({ ...s, error: 'Please fill in all required fields' }))
      return
    }

    setState((s) => ({ ...s, isLoading: true, error: '' }))

    try {
      const baseUrl = ensureNoTrailingSlash(mpsServer.trim())
      if (!/^https?:\/\//.test(baseUrl)) {
        throw new Error('Server URL must start with http:// or https://')
      }

      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(baseUrl)
      if (apiMode === 'redfish' && baseUrl.startsWith('http://') && !isLocalhost) {
        throw new Error(
          'Redfish mode requires https:// to avoid sending Basic auth credentials over an unencrypted connection'
        )
      }

      if (apiMode === 'rest') {
        // Support both deployment styles by trying both REST API auth paths.
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

        const systemPath = getSystemPathFromInput(deviceId.trim())

        // Try well-known action paths directly (no discovery GET, same as REST API flow)
        const actionPath = `${systemPath.replace(/\/+$/, '')}/Actions/Oem/IntelComputerSystem.GenerateRedirectionToken`
        const tokenRes = await fetch(toAbsoluteUrl(baseUrl, actionPath), {
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
        const token = tokenBody.token ?? tokenBody.RedirectionToken ?? tokenBody.Token
        if (!token) {
          throw new Error('No redirection token returned by action')
        }

        setState({
          token,
          deviceId: parseSystemIdFromPath(systemPath),
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
