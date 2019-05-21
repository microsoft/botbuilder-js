import { IStreamManager } from '../src/Payloads/IStreamManager';

import { ContentStreamAssembler } from '../src/Payloads/Assemblers/ContentStreamAssembler';

export class MockStreamManager implements IStreamManager {
  public getPayloadAssembler(id: string): ContentStreamAssembler {
    throw new Error('Method not implemented.');
  } public getPayloadStream(header: import('../src/Payloads/Models/Header').Header): import('../src/Stream').Stream {
    throw new Error('Method not implemented.');
  }
  public onReceive(header: import('../src/Payloads/Models/Header').Header, contentStream: import('../src/Stream').Stream, contentLength: number): void {
    throw new Error('Method not implemented.');
  }
  public closeStream(id: string): void {
    throw new Error('Method not implemented.');
  }
}
