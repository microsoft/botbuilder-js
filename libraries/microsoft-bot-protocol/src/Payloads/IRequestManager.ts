import { CancellationToken } from '../CancellationToken';
import { ReceiveResponse } from '../ReceiveResponse';

export interface IRequestManager {
  signalResponse(requestId: string, response: ReceiveResponse): Promise<boolean>;

  getResponseAsync(requestId: string, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
}
