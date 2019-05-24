export class TransportDisconnectedEventArgs {
  public static Empty: TransportDisconnectedEventArgs = new TransportDisconnectedEventArgs();
  public reason: string;

  constructor(reason?: string) {
    this.reason = reason;
  }
}
