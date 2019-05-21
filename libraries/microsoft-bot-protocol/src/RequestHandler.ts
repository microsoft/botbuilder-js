import { ReceiveRequest } from './ReceiveRequest';
import { Response } from './Response';

export abstract class RequestHandler {
  public abstract processRequestAsync(request: ReceiveRequest, logger?): Promise<Response>;
}
