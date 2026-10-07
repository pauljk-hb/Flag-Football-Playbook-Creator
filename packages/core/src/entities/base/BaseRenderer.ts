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
    const canvas = this.canvasManager.getRawCanvas();

    const objects = this.getFabricObjects();
    const controls = this.getControlObjects();

    const allObjects = [...objects, ...controls];

    if (allObjects.length === 0) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj && allObjects.includes(activeObj as any)) {
      canvas.discardActiveObject();
    }

    canvas.remove(...objects);

    if (controls.length > 0) {
      canvas.remove(...controls);
    }

    this.fabricObject = undefined;
    canvas.requestRenderAll();
  }
}
