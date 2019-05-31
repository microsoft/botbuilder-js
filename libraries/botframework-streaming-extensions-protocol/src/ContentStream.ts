import { ContentStreamAssembler } from './Payloads/Assemblers/ContentStreamAssembler';
import { Stream } from './Stream';

export class ContentStream {
  public id: string;
  private readonly assembler: ContentStreamAssembler;
  private stream: Stream;

  constructor(id: string, assembler: ContentStreamAssembler) {
    if (assembler === undefined) {
      throw Error('Null Argument Exception');
    }
    this.id = id;
    this.assembler = assembler;
  }

  public get type(): string {
    return this.assembler.contentType;
  }

  public get length(): number {
    return this.assembler.contentLength;
  }

  public getStream(): Stream {
    if (this.stream === undefined) {
      this.stream = this.assembler.getPayloadStream();
    }

    return this.stream;
  }

  public cancel(): void {
    this.assembler.close();
  }

  private async readAll(): Promise<Object> {
    // do a read-all
    let allData: Buffer[] = [];
    let count = 0;
    let stream = this.getStream();

    // populate the array with any existing buffers
    while (count < stream.length) {
      let chunk = stream.read(stream.length);
      allData.push(chunk);
      count += (<Buffer>chunk).length;
    }

    if (count < this.length) {
      let readToEnd = new Promise<boolean>((resolve) => {
        let callback = (cs: ContentStream) => (chunk: any) => {
          allData.push(chunk);
          count += (<Buffer>chunk).length;
          if (count === cs.length) {
            resolve(true);
          }
        };

        stream.subscribe(callback(this));
      });

      await readToEnd;
    }

    return {bufferArray: allData, size: count};
  }

  public async readAsString(): Promise<string> {
    let obj = await this.readAll();
    let allData = obj['bufferArray']
    let s: string = '';
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < allData.length; i++) {
      s += allData[i].toString('utf8');
    }

    return s;
  }

  public async readAsBuffer(): Promise<Buffer> {
    // do a read-all
    let obj = await this.readAll();
    let allData = obj['bufferArray']
    let count = obj['size'];

    // TODO: There's got to be a better way to do this.
    // Will revisit this after the big attachment problem is resolved.
    let s = new Buffer(count);
    let ptr = 0;
    for(var i = 0; i< allData.length; i++)
    {
      for (var j = 0 ; j < allData[i].length; j++)
      {
        s[ptr++] = allData[i][j];
      }
    }

    return s;
  }

  public async readAsJson<T>(): Promise<T> {
    let s = await this.readAsString();

    return <T>JSON.parse(s);
  }
}

