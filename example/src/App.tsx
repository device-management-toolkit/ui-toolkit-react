/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import React, { useState } from 'react'
import {
  KVM,
  Sol,
  AttachDiskImage
} from '@device-management-toolkit/ui-toolkit-react'
import { useAuth, type ApiMode } from './useAuth'

const envApiMode = import.meta.env.VITE_API_MODE === 'redfish' ? 'redfish' : 'restapi'

type TabType = 'kvm' | 'sol' | 'ider'

const TABS: { id: TabType; label: string }[] = [
  { id: 'kvm', label: 'KVM (Remote Desktop)' },
  { id: 'sol', label: 'SOL (Serial Over LAN)' },
  { id: 'ider', label: 'IDER (IDE Redirection)' }
]

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('kvm')
  const apiMode: ApiMode = envApiMode
  const [config, setConfig] = useState({
    mpsServer: '',
    deviceId: '',
    username: '',
    password: '',
    language: 'en'
  })

  const auth = useAuth()

  const getRelayServer = (baseUrl: string, mode: ApiMode): string => {
    const normalized = baseUrl.replace(/\/+$/, '')

    if (mode === 'restapi') {
      if (normalized.startsWith('https://')) {
        return `${normalized}/mps/ws/relay`
      }
      if (normalized.startsWith('http://')) {
        return `${normalized}/relay`
      }
      return normalized
    }

    if (normalized.startsWith('https://') || normalized.startsWith('http://')) {
      return `${normalized}/relay`
    }
    return normalized
  }
  const relayServer = getRelayServer(config.mpsServer, apiMode)

  const updateConfig = (field: string, value: string) => {
    setConfig((c) => ({ ...c, [field]: value }))
  }

  const componentProps = {
    deviceId: apiMode === 'redfish' ? auth.deviceId || config.deviceId : config.deviceId,
    mpsServer: relayServer,
    authToken: auth.token
  }

  return (
    <div className='app-container'>
      <div className='header'>
        <h1>UI Toolkit React - Test Application</h1>
        <p>Test KVM, SOL, and IDER components</p>
      </div>

      <div className='config-panel'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}
        >
          <span style={{ fontWeight: 600 }}>API Mode:</span>
          <span style={{ padding: '6px 10px' }}>
            {apiMode === 'redfish' ? 'Redfish API' : 'Console REST API'}
          </span>
        </div>

        <div className='config-grid'>
          <input
            placeholder='http(s)://<host[:port]>'
            value={config.mpsServer}
            onChange={(e) => updateConfig('mpsServer', e.target.value)}
            disabled={auth.isAuthenticated}
          />
          <input
            placeholder='Device ID'
            value={config.deviceId}
            onChange={(e) => updateConfig('deviceId', e.target.value)}
            disabled={auth.isAuthenticated}
          />
          <input
            placeholder='Username'
            value={config.username}
            onChange={(e) => updateConfig('username', e.target.value)}
            disabled={auth.isAuthenticated}
          />
          <input
            type='password'
            placeholder='Password'
            value={config.password}
            onChange={(e) => updateConfig('password', e.target.value)}
            disabled={auth.isAuthenticated}
          />
        </div>

        <div className='config-actions'>
          <button
            className={auth.isAuthenticated ? 'btn-danger' : 'btn-success'}
            onClick={() =>
              auth.isAuthenticated ? auth.disconnect() : auth.connect(config, apiMode)
            }
            disabled={auth.isLoading}
          >
            {auth.isLoading
              ? apiMode === 'restapi'
                ? 'Authenticating...'
                : 'Connecting...'
              : auth.isAuthenticated
                ? 'Disconnect'
                : apiMode === 'restapi'
                  ? 'Authenticate'
                  : 'Connect'}
          </button>
        </div>

        {auth.error && <div className='alert alert-error'>{auth.error}</div>}
      </div>

      {auth.isAuthenticated && (
        <>
          <div className='tabs'>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className='component-container'>
            {activeTab === 'kvm' ? (
              <KVM
                {...componentProps}
                autoConnect
                mouseDebounceTime={200}
                canvasHeight='480px'
                canvasWidth='100%'
                containerStyle={{
                  // Custom inline styles for the container
                  padding: '10px'
                }}
                connectButtonStyle={{
                  // Custom inline styles for connect button
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                canvasStyle={{
                  // Custom inline styles for canvas
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            ) : activeTab === 'sol' ? (
              <Sol
                {...componentProps}
                containerStyle={{
                  // Custom inline styles for the container
                  padding: '10px'
                }}
                buttonStyle={{
                  // Custom inline styles for the button
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                xtermStyle={{
                  // Custom inline styles for xterm terminal
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            ) : (
              <AttachDiskImage
                {...componentProps}
                fileSelectLabel='Browse ISO/IMG'
                noFileSelectedLabel='No file selected'
                containerStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '20px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                fileSelectStyle={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#fff',
                  backgroundColor: '#6c757d',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                fileNameStyle={{
                  fontSize: '14px',
                  color: '#333'
                }}
                buttonStyle={{
                  padding: '10px 40px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
