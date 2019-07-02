export class StreamDescription {
  public id: string;
  public type: string;
  public length?: number;

  constructor(id: string) {
    this.id = id;
  }
}
