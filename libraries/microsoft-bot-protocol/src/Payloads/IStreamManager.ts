import { Stream } from '../Stream';
import { ContentStreamAssembler } from './Assemblers/ContentStreamAssembler';
import { Header } from './Models/Header';

export abstract class IStreamManager {
  public abstract getPayloadAssembler(id: string): ContentStreamAssembler;
  public abstract getPayloadStream(header: Header): Stream;
  public abstract onReceive(header: Header, contentStream: Stream, contentLength: number): void;
  public abstract closeStream(id: string): void;
}
