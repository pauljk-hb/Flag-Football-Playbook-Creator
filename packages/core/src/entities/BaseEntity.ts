import * as fabric from "fabric";
import type { IEntity } from "../types/entities";

export abstract class BaseEntity implements IEntity {
  public readonly id: string;
  public abstract fabricObject: fabric.Object;

  constructor(id?: string) {
    this.id = id ?? crypto.randomUUID();
  }

  public getFabricObjects(): fabric.Object[] {
    if (!this.fabricObject) {
      throw new Error(
        `FabricObject für Entität ${this.id} wurde nicht initialisiert!`,
      );
    }
    // Standardmäßig ist es nur das Hauptobjekt
    return [this.fabricObject];
  }
}
