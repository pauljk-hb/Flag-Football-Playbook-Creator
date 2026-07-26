import * as fabric from "fabric";

export class CanvasManager {
  private canvas: fabric.Canvas | null = null;
  public readonly LOGICAL_WIDTH = 800;
  public readonly LOGICAL_HEIGHT = 600;

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

  public getCanvasDimensions(): { width: number; height: number } {
    return { width: this.LOGICAL_WIDTH, height: this.LOGICAL_HEIGHT };
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
    console.log("CanvasManager: Requesting render...");
    this.canvas?.requestRenderAll();
  }

  public getRawCanvas(): fabric.Canvas {
    if (!this.canvas) {
      throw new Error("CanvasManager is not initialized. Call init() first.");
    }
    return this.canvas;
  }

  public add(object: fabric.Object): void {
    this.canvas?.add(object);
  }

  public remove(object: fabric.Object): void {
    this.canvas?.remove(object);
  }

  public clear(): void {
    this.canvas?.clear();
  }

  /**
   * Schickt ein Objekt in den Hintergrund (z.B. für Routen).
   */
  public sendToBack(object: fabric.Object): void {
    this.canvas?.sendObjectToBack(object);
  }

  /**
   * Holt ein Objekt in den Vordergrund (z.B. für Spieler).
   */
  public bringObjectToFront(object: fabric.Object): void {
    this.canvas?.bringObjectToFront(object);
  }
}
