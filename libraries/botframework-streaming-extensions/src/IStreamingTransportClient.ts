import { CancellationToken } from './CancellationToken';
import { ReceiveResponse } from './ReceiveResponse';
import { Request } from './Request';

export interface IStreamingTransportClient {
  connectAsync(): Promise<void>;
  disconnect(): void;
  sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
}
