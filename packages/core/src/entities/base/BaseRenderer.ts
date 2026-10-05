import * as fabric from "fabric";
import type { BaseModel } from "./BaseModel";

export abstract class BaseRenderer<T extends BaseModel> {
  protected fabricObject?: any;
  protected currentModel?: T;

  constructor(
    protected canvasManager: any,
    protected eventBus: any,
  ) {}

  public abstract render(model: T): void;
  public abstract syncWithModel(model: T): void;

  public abstract setSelectable(enabled: boolean): void;
  public abstract showControls(): void;
  public abstract hideControls(): void;

  public getFabricObjects(): fabric.Object[] {
    const objects: fabric.Object[] = [];
    if (this.fabricObject) objects.push(this.fabricObject);
    return objects;
  }

  public getControlObjects(): fabric.Object[] {
    return [];
  }

  public destroy(): void {
    if (this.fabricObject) {
      this.canvasManager.removeFabricObject(this.fabricObject);
      this.fabricObject = undefined;
    }
  }
}
