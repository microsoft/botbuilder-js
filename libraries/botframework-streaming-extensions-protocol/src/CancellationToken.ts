export class CancellationToken {
  private cancelled: boolean;

  constructor() {
    this.cancelled = false;
  }

  public throwIfCancelled(): void {
    if (this.isCancelled()) {
      throw new Error('cancelled');
    }
  }

  public isCancelled(): boolean {
    return this.cancelled === true;
  }

  public cancel(): void {
    this.cancelled = true;
  }
}

export default class CancellationTokenSource {
  public readonly token: CancellationToken;

  constructor() {
    this.token = new CancellationToken();
  }

  public cancel(): void {
    this.token.cancel();
  }

}
