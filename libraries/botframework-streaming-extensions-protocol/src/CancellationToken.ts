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