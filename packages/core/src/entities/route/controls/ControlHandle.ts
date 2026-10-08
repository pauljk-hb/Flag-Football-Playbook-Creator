import * as fabric from "fabric";
import type { Point2D } from "../../../types/domain";

export interface IControlHandle {
  show(): void;
  hide(): void;
  destroy(): void;
  getFabricObject(): fabric.Object[];
  updatePosition(pos1: Point2D, pos2?: Point2D): void;
}

const DEFAULT_HANDLE_COLOR = "#ffd147";

export class WaypointHandle implements IControlHandle {
  public circle: fabric.Circle;
  private bezierHandles: BezierHandle[] = [];

  constructor(
    position: Point2D,
    private canvas: fabric.Canvas,
    routeId: string,
  ) {
    this.circle = new fabric.Circle({
      left: position.x,
      top: position.y,
      radius: 6,
      fill: DEFAULT_HANDLE_COLOR,
      stroke: "#000000",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      hoverCursor: "pointer",
      selectable: true,
      evented: true,
      visible: false,
    });
    this.circle.set({
      entityId: `node_${routeId}`,
      entityType: "NODE",
      parentId: routeId,
    });

    this.canvas.add(this.circle);
  }

  public getFabricObject(): fabric.Object[] {
    return [this.circle];
  }

  public updatePosition(newPos: Point2D): void {
    this.circle.set({ left: newPos.x, top: newPos.y });
    this.circle.setCoords();
  }

  public attachBezier(bezier: BezierHandle) {
    this.bezierHandles.push(bezier);
  }

  public show(): void {
    this.circle.set({ visible: true });
    this.canvas.bringObjectToFront(this.circle);
  }

  public hide(): void {
    this.circle.set({ visible: false });
  }

  public destroy(): void {
    this.canvas.remove(this.circle);
  }
}

export class BezierHandle implements IControlHandle {
  public controlPoint: fabric.Circle;
  private tetherLine: fabric.Line;

  constructor(
    cpPosition: Point2D,
    anchorPosition: Point2D,
    private canvas: fabric.Canvas,
    routeId: string,
  ) {
    this.tetherLine = new fabric.Line(
      [anchorPosition.x, anchorPosition.y, cpPosition.x, cpPosition.y],
      {
        stroke: "#424242",
        strokeWidth: 2,
        strokeDashArray: [3, 3],
        selectable: false,
        evented: false,
        visible: false,
      },
    );

    this.controlPoint = new fabric.Circle({
      left: cpPosition.x,
      top: cpPosition.y,
      radius: 4,
      fill: "#ffffff",
      stroke: DEFAULT_HANDLE_COLOR,
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      hoverCursor: "pointer",
      evented: true,
      visible: false,
    });

    this.controlPoint.set({
      entityId: `node_${routeId}`,
      entityType: "NODE",
      parentId: routeId,
    });

    this.canvas.add(this.tetherLine, this.controlPoint);
  }

  public getFabricObject(): fabric.Object[] {
    return [this.tetherLine, this.controlPoint];
  }

  public updatePosition(cpPos: Point2D, anchorPos: Point2D): void {
    this.controlPoint.set({ left: cpPos.x, top: cpPos.y });
    this.controlPoint.setCoords();

    this.tetherLine.set({
      x1: anchorPos.x,
      y1: anchorPos.y,
      x2: cpPos.x,
      y2: cpPos.y,
    });
    this.tetherLine.setCoords();
  }

  public updateAnchorPosition(anchorX: number, anchorY: number) {
    this.tetherLine.set({ x1: anchorX, y1: anchorY });
  }

  public show(): void {
    this.controlPoint.set({ visible: true });
    this.tetherLine.set({ visible: true });
    this.canvas.bringObjectToFront(this.tetherLine);
    this.canvas.bringObjectToFront(this.controlPoint);
  }

  public hide(): void {
    this.controlPoint.set({ visible: false });
    this.tetherLine.set({ visible: false });
  }

  public destroy(): void {
    this.canvas.remove(this.controlPoint, this.tetherLine);
  }
}

export class StretchHandle implements IControlHandle {
  public rect: fabric.Triangle;

  constructor(
    position: Point2D,
    stretchAxis: "X" | "Y" | "BOTH",
    private canvas: fabric.Canvas,
    routeId: string,
  ) {
    const cursor =
      stretchAxis === "X"
        ? "ew-resize"
        : stretchAxis === "Y"
          ? "ns-resize"
          : "pointer";

    this.rect = new fabric.Triangle({
      left: position.x,
      top: position.y,
      width: 13,
      height: 13,
      fill: DEFAULT_HANDLE_COLOR,
      stroke: "#000000",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      hoverCursor: cursor,
      moveCursor: cursor,
      lockMovementX: stretchAxis === "Y",
      lockMovementY: stretchAxis === "X",
      evented: true,
      visible: false,
    });

    this.rect.set({
      entityId: `node_${routeId}`,
      entityType: "NODE",
      parentId: routeId,
    });

    this.canvas.add(this.rect);
  }

  public getFabricObject(): fabric.Object[] {
    return [this.rect];
  }

  public updatePosition(newPos: Point2D): void {
    this.rect.set({ left: newPos.x, top: newPos.y });
    this.rect.setCoords();
  }

  public show(): void {
    this.rect.set({ visible: true });
    this.canvas.bringObjectToFront(this.rect);
  }

  public hide(): void {
    this.rect.set({ visible: false });
  }

  public destroy(): void {
    this.canvas.remove(this.rect);
  }
}
