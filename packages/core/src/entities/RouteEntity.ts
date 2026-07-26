// entities/RouteEntity.ts
import * as fabric from "fabric";
import { BaseEntity } from "./BaseEntity.js";
import {
  calculateArrowheadMetrics,
  calculatePolylineMetrics,
} from "../math/geometry.js";
import { setupRouteControls } from "./controls/routeControls.js";
import { MoveRouteCommand } from "../history/commands/MoveCommands.js";
import type { ICommand } from "../types/history.js";
import type { SavedRoute } from "../types/interfaces.js";

export interface RouteConfig {
  id?: string;
  points: { x: number; y: number }[];
  color: string;
}

export class RouteEntity extends BaseEntity {
  public fabricObject: fabric.Polyline;
  public arrowHead: fabric.Triangle;

  public onCommandGenerated?: (command: ICommand) => void;
  private dragStartPoints: { x: number; y: number }[] | null = null;

  constructor(config: RouteConfig) {
    super(config.id);

    this.fabricObject = new fabric.Polyline(config.points, {
      fill: "transparent",
      stroke: config.color,
      strokeWidth: 4,
      objectCaching: false,
      hasBorders: false,
      hasControls: true,
      perPixelTargetFind: true,
      targetFindTolerance: 12,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: "pointer",
      moveCursor: "pointer",
    });

    this.arrowHead = new fabric.Triangle({
      width: 14,
      height: 14,
      fill: config.color,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    this.updateArrow();
    this.setupEvents();
    setupRouteControls(this);
  }

  public getFabricObjects(): fabric.Object[] {
    return [this.fabricObject, this.arrowHead];
  }

  public addToCanvas(canvas: fabric.Canvas): void {
    canvas.add(this.fabricObject, this.arrowHead);
  }

  public removeFromCanvas(canvas: fabric.Canvas): void {
    canvas.remove(this.fabricObject, this.arrowHead);
  }

  public serialize(): SavedRoute {
    return {
      id: this.id,
      color: this.fabricObject.stroke as string,
      points: this.fabricObject.points?.map((p) => ({ x: p.x, y: p.y })) || [],
    };
  }

  public translate(dx: number, dy: number): void {
    const currentLeft = this.fabricObject.left ?? 0;
    const currentTop = this.fabricObject.top ?? 0;

    this.fabricObject.set({
      left: currentLeft + dx,
      top: currentTop + dy,
    });

    this.fabricObject.setCoords();
    this.updateArrow();
  }

  public updateArrow(): void {
    // 1. Sichere Werte aus dem Fabric-Objekt extrahieren
    const points = this.fabricObject.points || [];
    const left = this.fabricObject.left ?? 0;
    const top = this.fabricObject.top ?? 0;
    const pathOffset = this.fabricObject.pathOffset ?? { x: 0, y: 0 };

    // 2. Pure Math Utils aufrufen
    const { x, y, angle } = calculateArrowheadMetrics(
      points,
      left,
      top,
      pathOffset,
    );

    this.arrowHead.set({ left: x, top: y, angle: angle });
  }

  public updatePoints(newPoints: { x: number; y: number }[]): void {
    const polyObj = this.fabricObject;
    const currentPathOffset = polyObj.pathOffset ?? { x: 0, y: 0 };

    const metrics = calculatePolylineMetrics(newPoints, currentPathOffset);

    polyObj.set({
      points: newPoints.map((p) => new fabric.Point(p.x, p.y)),
      width: metrics.width,
      height: metrics.height,
      // Fabric braucht hier zwingend sein eigenes Point-Objekt
      pathOffset: new fabric.Point(metrics.pathOffset.x, metrics.pathOffset.y),
      left: (polyObj.left ?? 0) + metrics.dx,
      top: (polyObj.top ?? 0) + metrics.dy,
      dirty: true,
    });

    polyObj.setCoords();
    this.updateArrow();
  }

  private setupEvents(): void {
    this.fabricObject.on("mousedown", () => {
      this.dragStartPoints = this.fabricObject.points.map((p) => ({
        x: p.x,
        y: p.y,
      }));
    });

    this.fabricObject.on("modified", () => {
      if (!this.dragStartPoints) return;

      const currentPoints = this.fabricObject.points.map((p) => ({
        x: p.x,
        y: p.y,
      }));

      if (
        JSON.stringify(this.dragStartPoints) !== JSON.stringify(currentPoints)
      ) {
        if (this.onCommandGenerated) {
          this.onCommandGenerated(
            new MoveRouteCommand(this, this.dragStartPoints, currentPoints),
          );
        }
      }
      this.dragStartPoints = null;
    });
  }
}
