export abstract class BaseModel {
  public id: string;

  constructor(id?: string) {
    this.id = id ?? crypto.randomUUID();
  }

  public abstract serialize(): any;
}
