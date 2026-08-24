import * as fabric from "fabric";
import type { BaseEntity } from "../entities/BaseEntity";
import type { ThumbnailOptions } from "../types/interfaces";

export const CANVAS_SIZE = {
  width: 800,
  height: 600,
};

export class CanvasManager {
  private canvas: fabric.Canvas | null = null;
  public readonly LOGICAL_WIDTH = CANVAS_SIZE.width;
  public readonly LOGICAL_HEIGHT = CANVAS_SIZE.height;

  public init(canvasElement: HTMLCanvasElement): fabric.Canvas {
    this.canvas = new fabric.Canvas(canvasElement, {
      width: this.LOGICAL_WIDTH,
      height: this.LOGICAL_HEIGHT,
      backgroundColor: "#f8fafc",
      selection: false,
      preserveObjectStacking: true,
    });
    return this.canvas;
  }

  public dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }

  public handleResize(containerWidth: number): void {
    if (!this.canvas) return;

    const scale = containerWidth / this.LOGICAL_WIDTH;
    const newHeight = this.LOGICAL_HEIGHT * scale;

    this.canvas.setDimensions({
      width: containerWidth,
      height: newHeight,
    });

    this.canvas.setZoom(scale);
    this.requestRender();
  }

  public requestRender(): void {
    this.canvas?.requestRenderAll();
  }

  public getRawCanvas(): fabric.Canvas {
    if (!this.canvas) {
      throw new Error("CanvasManager is not initialized. Call init() first.");
    }
    return this.canvas;
  }

  public addEntity(entity: BaseEntity): void {
    const objects = entity.getFabricObjects();
    this.canvas?.add(...objects);
    this.requestRender();
  }

  public removeEntity(entity: BaseEntity): void {
    const objects = entity.getFabricObjects();
    this.canvas?.remove(...objects);
    this.requestRender();
  }

  public addFabricObject(object: fabric.Object): void {
    this.canvas?.add(object);
    this.requestRender();
  }

  public removeFabricObject(object: fabric.Object): void {
    this.canvas?.remove(object);
    this.requestRender();
  }

  public clear(): void {
    this.canvas?.clear();
    //this.canvas?.backgroundColor = "#F8FAFC";
  }

  public generateThumbnail(options: ThumbnailOptions): string {
    const { format = "png", quality = 0.8, width = 400 } = options;

    this.canvas!.discardActiveObject();
    this.canvas!.requestRenderAll();

    const finalMultiplier = width / this.canvas!.width;

    const dataUrl = this.canvas!.toDataURL({
      format,
      quality,
      multiplier: finalMultiplier,
    });

    return dataUrl;
  }

  public sendToBack(object: fabric.Object): void {
    this.canvas?.sendObjectToBack(object);
  }

  public bringObjectToFront(object: BaseEntity): void {
    const [firstObject] = object.getFabricObjects();
    if (!firstObject) return;

    this.canvas?.bringObjectToFront(firstObject);
  }
}
