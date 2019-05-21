import { Stream } from '../../Stream';
import { Header } from '../Models/Header';

export abstract class PayloadAssembler {
  public id: string;
  public end: boolean;
  private stream: Stream;

  constructor(id: string) {
    this.id = id;
  }

  public getPayloadStream(): Stream {
    if (!this.stream) {
      this.stream = this.createPayloadStream();
    }

    return this.stream;
  }

  public abstract createPayloadStream(): Stream;

  public onReceive(header: Header, stream?: Stream, contentLength?: number): void {
    this.end = header.End;
  }

  public abstract close(): void;
}
