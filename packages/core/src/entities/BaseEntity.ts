import * as fabric from "fabric";
import type { IEntity } from "../types/entities";

export abstract class BaseEntity implements IEntity {
  public id: string;

  constructor(id?: string) {
    this.id = id ?? crypto.randomUUID();
  }

  public abstract getFabricObjects(): fabric.Object[];

  public abstract setSelectable(enabled: boolean): void;
}
