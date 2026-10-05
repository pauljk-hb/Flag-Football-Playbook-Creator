// src/services/drawing/RouteDrawingService.ts
import * as fabric from "fabric";
import { SegmentType, type Point2D, type RouteNode } from "../../types/domain";
import { generateSvgPathString } from "../../utils/PathUtils";
import type { EventBus } from "../events/EventBus";

export class RouteDrawingService {
  private isDrawing = false;

  private activePlayerId: string | null = null;
  private activeColor: string = "black";
  private routeType: string = "default";
  private collectedNodes: RouteNode[] = [];

  private previewPath: fabric.Path | null = null;

  private boundMouseMove = this.handleMouseMove.bind(this);
  private boundMouseDown = this.handleMouseDown.bind(this);
  private boundDoubleClick = this.handleFinish.bind(this);
  private boundKeyDown = this.handleKeyDown.bind(this);

  constructor(
    private canvas: fabric.Canvas,
    private eventBus: EventBus,
  ) {}

  /**
   * Startet den Zeichenmodus. Wird von der PlaybookEngine aufgerufen.
   */
  public startDrawing(
    playerId: string,
    startPosition: Point2D,
    color: string,
    routeType: string = "default",
  ): void {
    if (this.isDrawing) this.cancelDrawing();

    this.isDrawing = true;
    this.activePlayerId = playerId;
    this.activeColor = color;
    this.routeType = routeType;

    this.collectedNodes = [
      { position: startPosition, type: SegmentType.STRAIGHT },
    ];

    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.on("mouse:move", this.boundMouseMove);
    this.canvas.on("mouse:down", this.boundMouseDown);
    this.canvas.on("mouse:dblclick", this.boundDoubleClick);
    window.addEventListener("keydown", this.boundKeyDown);

    this.canvas.defaultCursor = "crosshair";
  }

  private unbindEvents(): void {
    this.canvas.off("mouse:move", this.boundMouseMove);
    this.canvas.off("mouse:down", this.boundMouseDown);
    this.canvas.off("mouse:dblclick", this.boundDoubleClick);
    window.removeEventListener("keydown", this.boundKeyDown);

    this.canvas.defaultCursor = "default";
  }

  private handleMouseMove(options: any): void {
    if (!this.isDrawing) return;

    const pointer = this.getPointer(options);
    if (!pointer) return;

    const tempNodes = [
      ...this.collectedNodes,
      { position: pointer, type: SegmentType.STRAIGHT },
    ];

    this.updatePreviewPath(tempNodes);
  }

  private handleMouseDown(options: any): void {
    if (!this.isDrawing) return;

    // Rechtsklick bricht das Zeichnen ab
    if (options.e && (options.e as MouseEvent).button === 2) {
      this.cancelDrawing();
      return;
    }

    const pointer = this.getPointer(options);
    if (!pointer) return;

    const lastNode = this.collectedNodes[this.collectedNodes.length - 1];
    const dist = Math.hypot(
      pointer.x - lastNode.position.x,
      pointer.y - lastNode.position.y,
    );

    // Anti-Spam: Knotenpunkte müssen minimalen Abstand haben
    if (dist < 3) return;

    this.collectedNodes.push({
      position: pointer,
      type: SegmentType.STRAIGHT,
    });
  }

  private handleFinish(): void {
    if (!this.isDrawing || !this.activePlayerId) return;

    if (this.collectedNodes.length >= 2) {
      const finalPlayerId = this.activePlayerId;
      const finalNodes = [...this.collectedNodes];
      const finalType = this.routeType;

      this.stopDrawing();

      this.eventBus.emit("route:drawn", {
        playerId: finalPlayerId,
        routeType: finalType,
        nodes: finalNodes,
      });
    } else {
      this.cancelDrawing();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isDrawing) return;

    if (e.key === "Enter") {
      this.handleFinish();
    } else if (e.key === "Escape") {
      this.cancelDrawing();
    }
  }

  /**
   * Zeichnet die temporäre Linie (Vorschau), während die Maus bewegt wird.
   */
  private updatePreviewPath(nodes: RouteNode[]): void {
    if (this.previewPath) {
      this.canvas.remove(this.previewPath);
    }

    const svgString = generateSvgPathString(nodes);

    this.previewPath = new fabric.Path(svgString, {
      fill: "transparent",
      stroke: this.activeColor,
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });

    this.canvas.add(this.previewPath);
    this.canvas.requestRenderAll();
  }

  public cancelDrawing(): void {
    if (this.collectedNodes.length >= 2) {
      this.handleFinish();
      return;
    }
    this.stopDrawing();
  }

  /**
   * Räumt alles auf und setzt den Service zurück.
   */
  public stopDrawing(): void {
    if (this.previewPath) {
      this.canvas.remove(this.previewPath);
      this.previewPath = null;
    }

    this.unbindEvents();

    this.isDrawing = false;
    this.activePlayerId = null;
    this.collectedNodes = [];

    this.canvas.requestRenderAll();
  }

  private getPointer(options: any): { x: number; y: number } | null {
    if (options.scenePoint) {
      return { x: options.scenePoint.x, y: options.scenePoint.y };
    }
    if (options.viewportPoint) {
      return { x: options.viewportPoint.x, y: options.viewportPoint.y };
    }
    if (options.pointer) {
      return options.pointer;
    }
    return null;
  }
}
