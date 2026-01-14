/*********************************************************************
 * Copyright (c) Intel Corporation 2019
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

// Mock for @device-management-toolkit/ui-toolkit/core

export const Protocol = {
  SOL: 1,
  KVM: 2,
  IDER: 3
}

export class AmtTerminal {
  onSend: ((data: string) => void) | null = null

  StateChange(state: number): void {}
  TermSendKeys(data: string): void {}
}

export class AMTRedirector {
  onNewState: ((state: number) => void) | null = null
  onStateChanged: ((redirector: AMTRedirector, state: number) => void) | null =
    null
  onProcessData: ((data: string) => void) | null = null

  constructor(public config: RedirectorConfig) {}

  start(ws: typeof WebSocket): void {}
  stop(): void {}
  send(data: string): void {}
}

export class AMTKvmDataRedirector {
  onNewState: ((state: number) => void) | null = null
  onStateChanged:
    | ((redirector: AMTKvmDataRedirector, state: number) => void)
    | null = null
  onProcessData: ((data: string) => void) | null = null
  onStart: (() => void) | null = null
  onError: (() => void) | null = null
  onSendKvmData: ((data: string) => void) | null = null

  constructor(public config: RedirectorConfig) {}

  start(ws: typeof WebSocket): void {}
  stop(): void {}
  send(data: string): void {}
}

export class TerminalDataProcessor {
  processDataToXterm: ((str: string) => void) | null = null
  clearTerminal: (() => void) | null = null

  constructor(public terminal: AmtTerminal) {}

  processData(data: string): void {}
}

export class AMTDesktop {
  state: number = 0
  bpp: number = 1
  onSend: ((data: string) => void) | null = null
  onProcessData: ((data: string) => void) | null = null
  onKvmData: ((data: string) => void) | null = null

  constructor(public ctx: CanvasRenderingContext2D | null) {}

  processData(data: string): void {}
  start(): void {}
  onStateChange(state: number): void {}
  onSendKvmData(data: string): void {}
}

export class DataProcessor {
  constructor(
    public redirector: AMTKvmDataRedirector,
    public desktop: AMTDesktop
  ) {}

  processData(data: string): void {}
}

export class MouseHelper {
  constructor(
    public desktop: AMTDesktop,
    public redirector: AMTKvmDataRedirector,
    public debounceTime: number
  ) {}

  mousedown(event: MouseEvent): void {}
  mouseup(event: MouseEvent): void {}
  mousemove(event: MouseEvent): void {}
}

export class KeyBoardHelper {
  constructor(
    public desktop: AMTDesktop,
    public redirector: AMTKvmDataRedirector
  ) {}

  handleKeyEvent(event: KeyboardEvent): void {}
  GrabKeyInput(): void {}
  UnGrabKeyInput(): void {}
}

export class AMTIDER {
  onStateChanged: ((state: number) => void) | null = null
  sectorStats:
    | ((
        mode: number,
        dev: number,
        total: number,
        start: number,
        len: number
      ) => void)
    | null = null
  floppyRead = 0
  floppyWrite = 0
  cdromRead = 0
  cdromWrite = 0

  constructor(
    public redirector: AMTRedirector,
    public cdrom: File | null,
    public floppy: File | null
  ) {}

  start(): void {}
  stop(): void {}
  stateChange(state: number): void {}
  processData(data: string): void {}
}

export interface RedirectorConfig {
  mode: string
  protocol: number
  fr: FileReader
  host: string
  port: number
  user: string
  pass: string
  tls: number
  tls1only: number
  authToken: string
  server: string
}

export interface IDataProcessor {
  processData: (data: string) => void
}

export interface IKvmDataCommunicator {
  send: (data: string) => void
}

export interface Desktop {
  processData: (data: string) => void
  start: () => void
}
