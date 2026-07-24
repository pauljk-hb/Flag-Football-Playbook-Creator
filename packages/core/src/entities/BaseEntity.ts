import * as fabric from 'fabric';
import type { IEntity } from '../types/entities';

export abstract class BaseEntity implements IEntity {
  public readonly id: string;
  
  public abstract fabricObject: fabric.Object;

  constructor(id?: string) {
    this.id = id ?? crypto.randomUUID();
  }

  public addToCanvas(canvas: fabric.Canvas): void {
    if (this.fabricObject) {
      canvas.add(this.fabricObject);
    }
  }

  public removeFromCanvas(canvas: fabric.Canvas): void {
    if (this.fabricObject) {
      canvas.remove(this.fabricObject);
    }
  }
}