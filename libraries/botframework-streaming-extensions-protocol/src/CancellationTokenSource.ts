import { CancellationToken } from './CancellationToken';

export class CancellationTokenSource {
    public readonly token: CancellationToken;
  
    constructor() {
      this.token = new CancellationToken();
    }
  
    public cancel(): void {
      this.token.cancel();
    }
  
  }