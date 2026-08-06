import * as fabric from "fabric";
import { BaseEntity } from "./BaseEntity";
import { calculateArrowheadMetrics } from "../utils/geometry";
import { generateSvgPathString } from "../utils/PathUtils";
import type { RouteNode } from "../types/interfaces";
import { SegmentType } from "../types/interfaces";
import {
  BezierHandle,
  StretchHandle,
  WaypointHandle,
  type IControlHandle,
} from "./controls/ControlHandle";

export interface RouteConfig {
  id?: string;
  playerId: string; // Foreign Key zum Spieler!
  routeType: string; // 'main', 'option_1' etc.
  nodes: RouteNode[];
  color: string;
}

export class RouteEntity extends BaseEntity {
  public playerId: string;
  public routeType: string;
  public nodes: RouteNode[];
  public color: string;

  private fabricPath: fabric.Path;
  private arrowHead: fabric.Triangle;

  private handles: IControlHandle[] = [];

  public onNodesModified?: (
    routeId: string,
    oldNodes: RouteNode[],
    newNodes: RouteNode[],
  ) => void;

  private dragStartNodes: RouteNode[] | null = null;

  constructor(config: RouteConfig) {
    super(config.id);
    this.playerId = config.playerId;
    this.routeType = config.routeType;
    this.nodes = config.nodes;
    this.color = config.color;

    // 1. Pfad-Geometrie aus Nodes berechnen
    const pathString = generateSvgPathString(this.nodes);

    this.fabricPath = new fabric.Path(pathString, this.getPathStyleConfig());

    this.arrowHead = new fabric.Triangle({
      width: 14,
      height: 14,
      fill: this.color,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    this.fabricPath.set("id" as any, this.id);

    this.updateArrowPosition();
  }

  /**
   * Gibt das Konfigurationsobjekt für Fabric.js zurück.
   */
  private getPathStyleConfig(): any {
    let dashArray: number[] | undefined = undefined;

    // Styling-Logik (Akzeptiert 'option_1', 'option1', etc.)
    if (this.routeType.includes("option_1") || this.routeType === "option1") {
      dashArray = [12, 10];
    } else if (
      this.routeType.includes("option_2") ||
      this.routeType === "option2"
    ) {
      this.color = "#FFA500";
    }
    return {
      fill: "transparent",
      stroke: this.color,
      strokeWidth: 4,
      strokeLineCap: "round",
      strokeLineJoin: "round",
      strokeDashArray: dashArray,
      objectCaching: false,
      hasControls: false,
      hasBorders: false,
      perPixelTargetFind: true,
      targetFindTolerance: 15,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: "pointer",
      selectable: true,
      evented: true,
    };
  }

  /**
   * Zwingend von BaseEntity gefordert:
   * Gibt alle Fabric-Objekte zurück, die der CanvasManager zeichnen muss.
   */
  public getFabricObjects(): fabric.Object[] {
    return [this.fabricPath, this.arrowHead];
  }

  /**
   * Wird aufgerufen (z.B. vom SelectionManager oder beim AddRouteCommand),
   * um die Editier-Punkte auf das Canvas zu legen.
   */
  public initializeControls(canvas: fabric.Canvas): void {
    this.destroyAllHandles();

    this.nodes.forEach((node, index) => {
      if (index === 0) return;
      const waypoint = new WaypointHandle(node.x, node.y, canvas, this.id);

      waypoint.circle.on("mousedown", () => {
        this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));
      });

      waypoint.circle.on("moving", () => {
        this.nodes[index].x = waypoint.circle.left ?? 0;
        this.nodes[index].y = waypoint.circle.top ?? 0;

        this.updatePathVisuals();
        this.updateArrowPosition();

        canvas.requestRenderAll();
      });

      waypoint.circle.on("modified", () => {
        if (this.dragStartNodes && this.onNodesModified) {
          const newNodes = JSON.parse(JSON.stringify(this.nodes));

          // Wir feuern das Event nur, wenn sich wirklich was bewegt hat
          if (
            JSON.stringify(this.dragStartNodes) !== JSON.stringify(newNodes)
          ) {
            this.onNodesModified(this.id, this.dragStartNodes, newNodes);
          }
        }
        this.dragStartNodes = null; // Reset
      });

      this.handles.push(waypoint);
    });
  }

  /**
   * Macht die Handles sichtbar (Aufruf durch SelectionManager)
   */
  public showControls(): void {
    this.handles.forEach((h) => h.show());
  }

  /**
   * Versteckt die Handles (Aufruf durch SelectionManager)
   */
  public hideControls(): void {
    this.handles.forEach((h) => h.hide());
  }

  /**
   * Muss gerufen werden, bevor die Route gelöscht wird (Verhindert Memory Leaks)
   */
  public destroyAllHandles(): void {
    this.handles.forEach((h) => h.destroy());
    this.handles = [];
  }

  /**
   * Wird aufgerufen, wenn ein Handle bewegt wird.
   */
  private updatePathVisuals(): void {
    const newSvgString = generateSvgPathString(this.nodes);
    const tempPath = new fabric.Path(newSvgString);

    this.fabricPath.set({
      path: tempPath.path,
      left: tempPath.left,
      top: tempPath.top,
      width: tempPath.width,
      height: tempPath.height,
      pathOffset: tempPath.pathOffset,
    });

    const pathAny = this.fabricPath as any;
    delete pathAny.pathBbox;
    delete pathAny.segmentsInfo;
    delete pathAny._cachedPath;

    this.fabricPath.setCoords();
    this.fabricPath.dirty = true;

    this.updateArrowPosition();
  }

  /**
   * Wird aufgerufen (z.B. vom MovePlayerCommand), wenn der Spieler läuft.
   * Die Route muss sich synchron mitverschieben.
   */
  public translate(dx: number, dy: number): void {
    this.nodes.forEach((node) => {
      node.x += dx;
      node.y += dy;
      if (node.cpInX !== undefined) node.cpInX += dx;
      if (node.cpInY !== undefined) node.cpInY += dy;
      if (node.cpOutX !== undefined) node.cpOutX += dx;
      if (node.cpOutY !== undefined) node.cpOutY += dy;
    });

    // 2. Den Pfad neu zeichnen
    this.updatePathVisuals();

    // 3. ACHTUNG: Die Handles liegen absolut auf dem Canvas.
    // Wenn sie aktuell existieren, müssen sie zerstört und neu gebaut werden
    // (oder man gibt jedem Handle eine translate() Methode, das wäre performanter).
    // Fürs Erste (da sie meist beim Bewegen des Spielers unsichtbar sind):
    if (this.handles.length > 0 && this.handles[0].circle?.canvas) {
      this.initializeControls(this.handles[0].circle.canvas);
    }
  }

  /**
   * Wird vom Undo/Redo-System aufgerufen, um einen alten/neuen Zustand herzustellen.
   */
  public applyNodes(newNodes: RouteNode[], canvas?: fabric.Canvas): void {
    this.nodes = JSON.parse(JSON.stringify(newNodes));

    this.updatePathVisuals();

    if (canvas) {
      this.initializeControls(canvas);
      this.showControls();
    }
  }

  private updateArrowPosition(): void {
    const { x, y, angle } = calculateArrowheadMetrics(this.nodes);
    this.arrowHead.set({ left: x, top: y, angle: angle });
  }
}
