import * as fabric from 'fabric';

export interface IEntity {
  id: string;
  fabricObject: fabric.Object;
  addToCanvas(canvas: fabric.Canvas): void;
  removeFromCanvas(canvas: fabric.Canvas): void;
}