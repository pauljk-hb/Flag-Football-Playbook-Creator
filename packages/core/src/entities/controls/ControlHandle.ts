import * as fabric from "fabric";

export interface IControlHandle {
  setVisible(visible: boolean): void;
  destroy(): void;
  onMoved?: (newX: number, newY: number) => void;
  onMoveComplete?: () => void;
}

export class WaypointHandle implements IControlHandle {
  private circle: fabric.Circle;
  public onMoved?: (x: number, y: number) => void;
  public onMoveComplete?: () => void;
  private canvas: fabric.Canvas;
  private bezierHandles: BezierHandle[] = [];

  constructor(x: number, y: number, canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.circle = new fabric.Circle({
      left: x,
      top: y,
      radius: 6,
      fill: "#ffffff",
      stroke: "#000000",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      hoverCursor: "pointer",
    });

    this.setupEvents();
    this.canvas.add(this.circle);
  }

  public attachBezier(bezier: BezierHandle) {
    this.bezierHandles.push(bezier);
  }

  private setupEvents() {
    this.circle.on("moving", () => {
      const currentX = this.circle.left ?? 0;
      const currentY = this.circle.top ?? 0;

      this.bezierHandles.forEach((handle) => {
        handle.updateAnchorPosition(currentX, currentY);
      });

      if (this.onMoved) {
        this.onMoved(currentX, currentY);
      }
    });

    this.circle.on("modified", () => {
      if (this.onMoveComplete) this.onMoveComplete();
    });
  }

  public setVisible(visible: boolean): void {
    this.circle.visible = visible;
    if (this.circle.canvas) {
      this.circle.canvas.requestRenderAll();
    }
  }

  public destroy(): void {
    if (this.circle.canvas) {
      this.circle.canvas.remove(this.circle);
    }
  }
}

export class BezierHandle implements IControlHandle {
  private controlPoint: fabric.Circle;
  private tetherLine: fabric.Line;
  public onMoved?: (x: number, y: number) => void;
  public onMoveComplete?: () => void;
  private canvas: fabric.Canvas;

  constructor(
    startX: number,
    startY: number,
    anchorX: number,
    anchorY: number,
    canvas: fabric.Canvas,
  ) {
    this.canvas = canvas;
    this.tetherLine = new fabric.Line([anchorX, anchorY, startX, startY], {
      stroke: "#999",
      strokeWidth: 1,
      strokeDashArray: [3, 3],
      selectable: false,
      evented: false,
    });

    this.controlPoint = new fabric.Circle({
      left: startX,
      top: startY,
      radius: 4,
      fill: "#ffffff",
      stroke: "#3498db",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      hoverCursor: "pointer",
    });

    this.setupEvents();
    this.canvas.add(this.tetherLine, this.controlPoint);
  }

  private setupEvents() {
    this.controlPoint.on("moving", () => {
      this.tetherLine.set({
        x2: this.controlPoint.left,
        y2: this.controlPoint.top,
      });

      if (this.onMoved) {
        this.onMoved(this.controlPoint.left ?? 0, this.controlPoint.top ?? 0);
      }
    });

    this.controlPoint.on("modified", () => {
      if (this.onMoveComplete) this.onMoveComplete();
    });
  }

  public updateAnchorPosition(anchorX: number, anchorY: number) {
    this.tetherLine.set({ x1: anchorX, y1: anchorY });
  }

  public setVisible(visible: boolean): void {
    this.controlPoint.visible = visible;
    this.tetherLine.visible = visible;
    if (this.canvas) {
      this.canvas.requestRenderAll();
    }
  }

  public destroy(): void {
    if (this.canvas) {
      this.canvas.remove(this.controlPoint, this.tetherLine);
    }
  }
}

export class StretchHandle implements IControlHandle {
  private rect: fabric.Rect;
  public onMoved?: (x: number, y: number) => void;
  public onMoveComplete?: () => void;
  private canvas: fabric.Canvas;

  constructor(
    x: number,
    y: number,
    stretchAxis: "X" | "Y" | "BOTH",
    canvas: fabric.Canvas,
  ) {
    this.canvas = canvas;

    // Cursor basierend auf der Achse setzen (ew-resize = Links/Rechts, ns-resize = Oben/Unten)
    const cursor =
      stretchAxis === "X"
        ? "ew-resize"
        : stretchAxis === "Y"
          ? "ns-resize"
          : "pointer";

    this.rect = new fabric.Rect({
      left: x,
      top: y,
      width: 12,
      height: 12,
      fill: "#f1c40f", // Markantes Gelb/Gold zur Unterscheidung
      stroke: "#000000",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      hoverCursor: cursor,
      moveCursor: cursor,
      // Die Magie des StretchHandles: Wir sperren die Achsen entsprechend!
      lockMovementX: stretchAxis === "Y",
      lockMovementY: stretchAxis === "X",
    });

    this.setupEvents();
    this.canvas.add(this.rect);
  }

  private setupEvents() {
    this.rect.on("moving", () => {
      if (this.onMoved) {
        this.onMoved(this.rect.left ?? 0, this.rect.top ?? 0);
      }
    });

    this.rect.on("modified", () => {
      if (this.onMoveComplete) this.onMoveComplete();
    });
  }

  public setVisible(visible: boolean): void {
    this.rect.visible = visible;
    if (this.rect.canvas) {
      this.rect.canvas.requestRenderAll();
    }
  }

  public destroy(): void {
    if (this.rect.canvas) {
      this.rect.canvas.remove(this.rect);
    }
  }
}
