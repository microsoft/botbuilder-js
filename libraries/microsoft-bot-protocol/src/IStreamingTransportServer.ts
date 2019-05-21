import { CancellationToken } from './CancellationToken';
import { ReceiveResponse } from './ReceiveResponse';
import { Request } from './Request';

export interface IStreamingTransportServer {
  startAsync(): Promise<string>;
  disconnect(): void;
  sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
}
