/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export interface ISocket {
  isConnected(): boolean;
  write(buffer: Buffer);
  connectAsync(serverAddress: string): Promise<void>;
  closeAsync();
  setOnMessageHandler(handler: (x: any) => void);
  setOnErrorHandler(handler: (x: any) => void);
  setOnCloseHandler(handler: (x: any) => void);
}
