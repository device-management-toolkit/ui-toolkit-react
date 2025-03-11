/*********************************************************************
* Copyright (c) Intel Corporation 2023
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import React, { useState } from 'react'
import { IDER } from './ider'

interface AttachDiskImageProps {
  deviceId: string | null
  mpsServer: string | null
  authToken?: string
}

export const AttachDiskImage = ({ 
  deviceId, 
  mpsServer, 
  authToken 
}: AttachDiskImageProps): React.ReactElement => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [iderState, setIderState] = useState(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    setSelectedFile(file)
  }

  const updateIderState = (newState: number) => {
    setIderState(newState)
  }

  return (
    <div>
      <IDER
        iderState={iderState}
        updateIderState={updateIderState}
        deviceId={deviceId}
        mpsServer={mpsServer}
        authToken={authToken}
        cdrom={selectedFile}
        floppy={null}
        data-testid="ider-component" 
        iderData={null}
      />
      <input 
        data-testid="file-input" 
        type="file" 
        onChange={handleFileChange} 
      />
      <button 
        onClick={() => iderState === 0 ? updateIderState(1) : updateIderState(0)}
        disabled={!selectedFile}
      >
        {iderState === 0 ? 'Start IDER' : 'Stop IDER'}
      </button>
    </div>
  )
}