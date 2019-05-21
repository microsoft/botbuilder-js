export class StreamDescription {
  public id: string;
  public payloadType: string;
  public length?: number;

  constructor(id: string) {
    this.id = id;
  }
}
