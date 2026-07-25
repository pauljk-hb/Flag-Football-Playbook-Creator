import * as fabric from "fabric";

export interface IEntity {
  id: string;
  fabricObject: fabric.Object;
  getFabricObjects(): fabric.Object[];
}
