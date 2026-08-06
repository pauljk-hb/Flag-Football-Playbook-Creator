import * as fabric from "fabric";

export interface IControlHandle {
  show(): void;
  hide(): void;
  destroy(): void;
  onMoved?: (newX: number, newY: number) => void;
  onMoveComplete?: () => void;
}

export class WaypointHandle implements IControlHandle {
  public circle: fabric.Circle;
  public onMoved?: (x: number, y: number) => void;
  public onMoveComplete?: () => void;
  private bezierHandles: BezierHandle[] = [];

  constructor(
    x: number,
    y: number,
    private canvas: fabric.Canvas,
    routeId: string, // NEU: routeId für die Markierung
  ) {
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
      selectable: true,
      evented: true,
      visible: false,
    });

    this.setupEvents();

    // WICHTIG: Damit der SelectionManager das Handle nicht versehentlich deselektiert
    this.circle.set("isRouteHandle" as keyof fabric.Object, true);
    this.circle.set("parentRouteId" as keyof fabric.Object, routeId);

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
  private controlPoint: fabric.Circle;
  private tetherLine: fabric.Line;
  public onMoved?: (x: number, y: number) => void;
  public onMoveComplete?: () => void;

  constructor(
    startX: number,
    startY: number,
    anchorX: number,
    anchorY: number,
    private canvas: fabric.Canvas,
    routeId: string, // NEU: routeId
  ) {
    this.tetherLine = new fabric.Line([anchorX, anchorY, startX, startY], {
      stroke: "#999",
      strokeWidth: 1,
      strokeDashArray: [3, 3],
      selectable: false, // Die Linie selbst kann man nicht anklicken
      evented: false,
      visible: false, // WICHTIG: Anfangs unsichtbar
    });

    this.controlPoint = new fabric.Circle({
      left: startX,
      top: startY,
      radius: 4,
      fill: "#ffffff",
      stroke: "#3498db", // Blau markiert es als Bezier-Punkt
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      hoverCursor: "pointer",
      visible: false, // WICHTIG: Anfangs unsichtbar
    });

    this.setupEvents();

    // Markierung an das klickbare ControlPoint binden
    this.controlPoint.set("isRouteHandle" as keyof fabric.Object, true);
    this.controlPoint.set("parentRouteId" as keyof fabric.Object, routeId);

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

  public show(): void {
    this.controlPoint.set({ visible: true });
    this.tetherLine.set({ visible: true });
    this.canvas.bringObjectToFront(this.tetherLine);
    this.canvas.bringObjectToFront(this.controlPoint); // Der Punkt muss GANZ oben liegen
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
  public onMoved?: (x: number, y: number) => void;
  public onMoveComplete?: () => void;

  constructor(
    x: number,
    y: number,
    stretchAxis: "X" | "Y" | "BOTH",
    private canvas: fabric.Canvas,
    routeId: string, // NEU: routeId
  ) {
    const cursor =
      stretchAxis === "X"
        ? "ew-resize"
        : stretchAxis === "Y"
          ? "ns-resize"
          : "pointer";

    this.rect = new fabric.Triangle({
      left: x,
      top: y,
      width: 13,
      height: 13,
      fill: "#ffffff",
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
      visible: false,
    });

    this.setupEvents();

    // Markierung
    this.rect.set("isRouteHandle" as keyof fabric.Object, true);
    this.rect.set("parentRouteId" as keyof fabric.Object, routeId);

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
