import { TransportContants } from '../Transport/TransportConstants';
import { Header } from './Models/Header';
import { PayloadTypes } from './Models/PayloadTypes';

export class HeaderSerializer {
  public static readonly Delimiter = '.';
  public static readonly Terminator = '\n';
  public static readonly End = '1';
  public static readonly NotEnd = '0';
  public static readonly TypeOffset: number = 0;
  public static readonly TypeDelimiterOffset = 1;
  public static readonly LengthOffset = 2;
  public static readonly LengthLength = 6;
  public static readonly LengthDelimeterOffset = 8;
  public static readonly IdOffset = 9;
  public static readonly IdLength = 36;
  public static readonly IdDelimeterOffset = 45;
  public static readonly EndOffset = 46;
  public static readonly TerminatorOffset = 47;
  public static readonly Encoding = 'utf8';

  public static serialize(header: Header, buffer: Buffer): void {
    buffer.write(header.PayloadType, this.TypeOffset, 1,  this.Encoding);
    buffer.write(this.Delimiter, this.TypeDelimiterOffset, 1, this.Encoding);
    buffer.write(this.headerLengthPadder(header.PayloadLength, this.LengthLength, '0'), this.LengthOffset, this.LengthLength, this.Encoding);
    buffer.write(this.Delimiter, this.LengthDelimeterOffset, 1, this.Encoding);
    buffer.write(header.Id, this.IdOffset);
    buffer.write(this.Delimiter, this.IdDelimeterOffset, 1, this.Encoding);
    buffer.write(header.End ? this.End : this.NotEnd, this.EndOffset);
    buffer.write(this.Terminator, this.TerminatorOffset);
  }

  public static deserialize(buffer: Buffer): Header {
    let jsonBuffer = buffer.toString(this.Encoding);
    let headerArray = jsonBuffer.split(this.Delimiter);

    if (headerArray.length !== 4) {
      throw Error('Cannot parse header, header is malformed.');
    }

    let headerPayloadType = headerArray[0];
    let headerPayloadLength = Number(headerArray[1]);
    let headerId = headerArray[2];
    let headerEnd = headerArray[3] === '0\n' ? false : headerArray[3] === '1\n' ? true : undefined;
    let header = new Header(headerPayloadType, headerPayloadLength, headerId, headerEnd);

    if (isNaN(header.PayloadLength) || header.PayloadLength === undefined) {
      throw Error('Header Length is missing or malformed.');
    }

    if (header.PayloadType.length !== this.TypeDelimiterOffset) {
      throw Error('Header Type is missing or malformed.');
    }

    if (!header.Id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) || header.Id === undefined || header.Id.length !== this.IdLength) {
      throw Error('Header ID is missing or malformed.');
    }

    if (header.End === undefined) {
      throw Error('Header End is missing or not a valid value.');
    }

    return header;
  }

  public static headerLengthPadder(lengthValue: number, totalLength: number, padChar: string): string {
    let result = Array(totalLength + 1)
      .join(padChar);

    let lengthString = lengthValue.toString();

    return (result + lengthString).slice(lengthString.length);
  }
}
