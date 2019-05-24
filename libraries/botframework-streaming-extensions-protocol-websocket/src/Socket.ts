export interface Socket {
  isConnected(): boolean;
  write(buffer: Buffer);
  connectAsync(): Promise<void>;
  closeAsync();
  setOnMessageHandler(handler: (x: any) => void);
  setOnErrorHandler(handler: (x: any) => void);
  setOnCloseHandler(handler: (x: any) => void);
}
