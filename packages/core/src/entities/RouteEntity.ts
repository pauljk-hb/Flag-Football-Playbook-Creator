import * as fabric from "fabric";
import { CANVAS_SIZE } from "../managers/CanvasManager";
import type { RouteNode } from "../types/interfaces";
import { SegmentType } from "../types/interfaces";
import {
  calculateArrowheadMetrics,
  clampPoint,
  constrainRouteToCanvas,
} from "../utils/geometry";
import { generateSvgPathString } from "../utils/PathUtils";
import { BaseEntity } from "./BaseEntity";
import {
  BezierHandle,
  StretchHandle,
  WaypointHandle,
  type IControlHandle,
} from "./controls/ControlHandle";

export interface RouteConfig {
  id?: string;
  playerId: string;
  routeType: string;
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

    const pathString = generateSvgPathString(this.nodes);

    this.fabricPath = new fabric.Path(pathString, this.getPathStyleConfig());

    this.arrowHead = new fabric.Triangle({
      width: 24,
      height: 24,
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

    switch (this.routeType) {
      case "option_1":
        dashArray = [12, 10];
        break;
      case "option_2":
        this.color = "#FFA500";
        break;
      case "default":
        break;
      default:
        break;
    }

    return {
      fill: "transparent",
      stroke: this.color,
      strokeWidth: 8,
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

  public setSelectable(enabled: boolean): void {
    if (this.fabricPath) {
      this.fabricPath.selectable = enabled;
      this.fabricPath.evented = enabled;
    }

    if (this.arrowHead) {
      this.arrowHead.selectable = false;
      this.arrowHead.evented = false;
      this.arrowHead.hasControls = false;
      this.arrowHead.hasBorders = false;
    }
  }

  /**
   * Wird aufgerufen (z.B. vom SelectionManager oder beim AddRouteCommand),
   * um die Editier-Punkte auf das Canvas zu legen.
   */
  public initializeControls(canvas: fabric.Canvas): void {
    this.destroyAllHandles();

    const STRETCH_OFFSET_Y = -25;
    const PADDING = 10;

    const controlsMap: { waypoint: WaypointHandle; stretch?: StretchHandle }[] =
      [];

    this.nodes.forEach((node, index) => {
      if (index === 0) return;

      const waypoint = new WaypointHandle(node.x, node.y, canvas, this.id);
      this.handles.push(waypoint);

      const prevNode = this.nodes[index - 1];
      const isVerticalLine = Math.abs(node.x - prevNode.x) < 10;
      let stretchHandle: StretchHandle | undefined;

      if (isVerticalLine) {
        stretchHandle = new StretchHandle(
          node.x,
          node.y + STRETCH_OFFSET_Y,
          "Y",
          canvas,
          this.id,
        );
        this.handles.push(stretchHandle);
      }

      controlsMap[index] = { waypoint, stretch: stretchHandle };

      let bezierHandle: BezierHandle | undefined;

      if (
        node.type === SegmentType.CURVE &&
        node.cpInX !== undefined &&
        node.cpInY !== undefined
      ) {
        bezierHandle = new BezierHandle(
          node.cpInX,
          node.cpInY,
          node.x,
          node.y,
          canvas,
          this.id,
        );
        this.handles.push(bezierHandle);

        waypoint.attachBezier(bezierHandle);

        bezierHandle.onMoved = (newX, newY) => {
          if (!this.dragStartNodes) {
            this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));
          }

          const clamped = clampPoint(
            { x: newX, y: newY },
            CANVAS_SIZE.width,
            CANVAS_SIZE.height,
            PADDING,
          );

          this.nodes[index].cpInX = clamped.x;
          this.nodes[index].cpInY = clamped.y;

          this.updatePathVisuals();
          this.updateArrowPosition();
          canvas.requestRenderAll();
        };

        bezierHandle.onMoveComplete = () => this.fireModifiedEvent();
      }

      // Event für WaypointHandle
      waypoint.circle.on("mousedown", () => {
        this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));
      });

      waypoint.circle.on("moving", () => {
        if (!this.dragStartNodes)
          this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));

        const clamped = clampPoint(
          { x: waypoint.circle.left ?? 0, y: waypoint.circle.top ?? 0 },
          CANVAS_SIZE.width,
          CANVAS_SIZE.height,
          PADDING,
        );

        waypoint.circle.set({
          left: clamped.x,
          top: clamped.y,
        });

        this.nodes[index].x = clamped.x;
        this.nodes[index].y = clamped.y;

        if (stretchHandle) {
          stretchHandle.rect.set({
            left: this.nodes[index].x,
            top: this.nodes[index].y + STRETCH_OFFSET_Y,
          });
          stretchHandle.rect.setCoords();
        }

        this.updatePathVisuals();
        this.updateArrowPosition();
        canvas.requestRenderAll();
      });

      waypoint.circle.on("modified", () => this.fireModifiedEvent());

      // Event für StretchHandle
      if (stretchHandle) {
        stretchHandle.rect.on("mousedown", () => {
          this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));
        });

        stretchHandle.rect.on("moving", () => {
          if (!this.dragStartNodes)
            this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));

          const startNodes = this.dragStartNodes!;

          const startHandleY = startNodes[index].y + STRETCH_OFFSET_Y;
          const currentHandleY = stretchHandle!.rect.top ?? 0;
          const dy = currentHandleY - startHandleY;

          // Stretch-Loop: Verschiebt diesen Node und ALLE FOLGENDEN auf der Y-Achse
          for (let i = index; i < this.nodes.length; i++) {
            this.nodes[i].y = startNodes[i].y + dy;

            // Kurven-Kontrollpunkte synchronisieren (falls vorhanden)
            if (this.nodes[i].cpInY !== undefined)
              this.nodes[i].cpInY = startNodes[i].cpInY! + dy;
            if (this.nodes[i].cpOutY !== undefined)
              this.nodes[i].cpOutY = startNodes[i].cpOutY! + dy;

            // Visuelles Update der anderen Handles, damit sie live mit der Linie mitlaufen
            if (controlsMap[i]) {
              controlsMap[i].waypoint.circle.set({ top: this.nodes[i].y });
              controlsMap[i].waypoint.circle.setCoords();

              if (controlsMap[i].stretch && i !== index) {
                controlsMap[i].stretch!.rect.set({
                  top: this.nodes[i].y + STRETCH_OFFSET_Y,
                });
                controlsMap[i].stretch!.rect.setCoords();
              }
            }
          }

          this.updatePathVisuals();
          this.updateArrowPosition();
          canvas.requestRenderAll();
        });

        stretchHandle.rect.on("modified", () => this.fireModifiedEvent());
      }
    });
  }

  /**
   * Hilfsfunktion, um Code-Duplizierung beim Speichern der Undo/Redo Historie zu vermeiden.
   */
  private fireModifiedEvent(): void {
    if (this.dragStartNodes && this.onNodesModified) {
      const newNodes = JSON.parse(JSON.stringify(this.nodes));

      if (JSON.stringify(this.dragStartNodes) !== JSON.stringify(newNodes)) {
        this.onNodesModified(this.id, this.dragStartNodes, newNodes);
      }
    }
    this.dragStartNodes = null;
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

    ((this.nodes = constrainRouteToCanvas(
      this.nodes,
      CANVAS_SIZE.width,
      CANVAS_SIZE.height,
    )),
      this.updatePathVisuals());

    if (this.handles.length > 0 && this.fabricPath.canvas) {
      this.initializeControls(this.fabricPath.canvas);
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
