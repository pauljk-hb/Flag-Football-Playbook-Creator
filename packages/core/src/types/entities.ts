import * as fabric from "fabric";

export interface IEntity {
  id: string;
  getFabricObjects(): fabric.Object[];
}
