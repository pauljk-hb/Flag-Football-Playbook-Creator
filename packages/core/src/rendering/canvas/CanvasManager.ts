import * as fabric from "fabric";
import { CANVAS } from "../../constants/constants";
import type { ThumbnailOptions } from "../../types/export";

export class CanvasManager {
  private canvas: fabric.Canvas;
  public readonly LOGICAL_WIDTH = CANVAS.WIDTH;
  public readonly LOGICAL_HEIGHT = CANVAS.HEIGHT;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(canvasElement, {
      width: this.LOGICAL_WIDTH,
      height: this.LOGICAL_HEIGHT,
      backgroundColor: CANVAS.BACKGROUND_COLOR,
      selection: false,
      preserveObjectStacking: true,
    });
  }

  public getRawCanvas(): fabric.Canvas {
    return this.canvas;
  }

  public dispose(): void {
    this.canvas.dispose();
  }

  public handleResize(containerWidth: number): void {
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
    this.canvas.requestRenderAll();
  }

  public addFabricObject(object: fabric.Object): void {
    this.canvas.add(object);
    this.requestRender();
  }

  public removeFabricObject(object: fabric.Object): void {
    this.canvas.remove(object);
    this.requestRender();
  }

  public clear(): void {
    this.canvas.clear();
    this.canvas.backgroundColor = CANVAS.BACKGROUND_COLOR;
  }

  public generateThumbnail(options: ThumbnailOptions = {}): string {
    const { format = "png", quality = 0.8, width = 400 } = options;

    this.canvas.discardActiveObject();
    this.requestRender();

    const dataUrl = this.canvas!.toDataURL({
      format,
      quality,
      multiplier: width / this.canvas.width!,
    });

    return dataUrl;
  }
}
