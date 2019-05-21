import { TransportContants } from '../../Transport/TransportConstants';

export class Header {
  public PayloadType: string;

  public PayloadLength: number;

  public Id: string;

  public End: boolean;

  constructor(payloadType: string, payloadLength: number, id: string, end: boolean) {
    this.PayloadType = payloadType;
    this.clampLength(payloadLength, TransportContants.MaxLength, TransportContants.MinLength);
    this.PayloadLength = payloadLength;
    this.Id = id;
    this.End = end;
  }

  private clampLength(value, max, min): void {
    if (value > max) {
      throw new Error(`Length must be less than ${TransportContants.MaxLength.toString()}`);
    }
    if (value < min) {
      throw new Error(`Length must be greater than ${TransportContants.MinLength.toString()}`);
    }
  }
}
