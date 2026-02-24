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
import { useAuth } from './useAuth'

type TabType = 'kvm' | 'sol' | 'ider'

const TABS: { id: TabType; label: string }[] = [
  { id: 'kvm', label: 'KVM (Remote Desktop)' },
  { id: 'sol', label: 'SOL (Serial Over LAN)' },
  { id: 'ider', label: 'IDER (IDE Redirection)' }
]

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('kvm')
  const [config, setConfig] = useState({
    mpsServer: '',
    deviceId: '',
    username: '',
    password: '',
    language: 'en'
  })

  const auth = useAuth()
  const getRelayServer = (baseUrl: string): string => {
    if (baseUrl.startsWith('https://')) {
      return `${baseUrl}/mps/ws/relay`
    }
    if (baseUrl.startsWith('http://')) {
      return `${baseUrl}/relay`
    }
    return baseUrl
  }
  const relayServer = getRelayServer(config.mpsServer)

  const updateConfig = (field: string, value: string) => {
    setConfig((c) => ({ ...c, [field]: value }))
  }

  const componentProps = {
    deviceId: config.deviceId,
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
        <div className='config-grid'>
          <input
            placeholder='/mps/login or /api/v1/authorize'
            value={config.mpsServer}
            onChange={(e) => updateConfig('mpsServer', e.target.value)}
            disabled={auth.isAuthenticated}
          />
          <input
            placeholder='Device GUID'
            value={config.deviceId}
            onChange={(e) => updateConfig('deviceId', e.target.value)}
            disabled={auth.isAuthenticated}
          />
          <input
            placeholder='MPS Username'
            value={config.username}
            onChange={(e) => updateConfig('username', e.target.value)}
            disabled={auth.isAuthenticated}
          />
          <input
            type='password'
            placeholder='MPS Password'
            value={config.password}
            onChange={(e) => updateConfig('password', e.target.value)}
            disabled={auth.isAuthenticated}
          />
        </div>

        <div className='config-actions'>
          <button
            className={auth.isAuthenticated ? 'btn-danger' : 'btn-success'}
            onClick={() =>
              auth.isAuthenticated ? auth.disconnect() : auth.connect(config)
            }
            disabled={auth.isLoading}
          >
            {auth.isLoading
              ? 'Authenticating...'
              : auth.isAuthenticated
                ? 'Disconnect'
                : 'Authenticate'}
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
