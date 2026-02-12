/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { useState } from 'react'

interface AuthState {
  token: string
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

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    token: '',
    isAuthenticated: false,
    isLoading: false,
    error: ''
  })

  const connect = async (config: AuthConfig) => {
    const { mpsServer, deviceId, username, password } = config

    if (!username || !password || !deviceId || !mpsServer) {
      setState((s) => ({ ...s, error: 'Please fill in all required fields' }))
      return
    }

    setState((s) => ({ ...s, isLoading: true, error: '' }))

    try {
      // Determine API path based on protocol
      // HTTPS: /mps/login/api/v1/authorize
      // HTTP:  /api/v1/authorize
      const isHttps = mpsServer.startsWith('https://')
      const authPath = isHttps ? '/mps/login/api/v1/authorize' : '/api/v1/authorize'

      // Get access token
      const authRes = await fetch(`${mpsServer}${authPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!authRes.ok)
        throw new Error(`Authentication failed: ${authRes.statusText}`)

      const { token: accessToken } = await authRes.json()
      if (!accessToken) throw new Error('No token received')

      // Get redirection token
      const redirRes = await fetch(
        `${mpsServer}${authPath}/redirection/${deviceId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (!redirRes.ok)
        throw new Error(`Redirection failed: ${redirRes.statusText}`)

      const { token } = await redirRes.json()
      if (!token) throw new Error('No redirection token received')

      setState({ token, isAuthenticated: true, isLoading: false, error: '' })
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
      isAuthenticated: false,
      isLoading: false,
      error: ''
    })
  }

  return { ...state, connect, disconnect }
}
