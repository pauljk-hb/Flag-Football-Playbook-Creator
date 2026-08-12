import * as fabric from "fabric";
import type { PlayerEntity } from "../entities/PlayerEntity";
import { type RouteNode, SegmentType } from "../types/interfaces";
import { generateSvgPathString } from "../utils/PathUtils";
import type { CanvasManager } from "./CanvasManager";
import type { SelectionManager } from "./SelectionManager";

export class RouteDrawingManager {
  private isDrawing = false;
  private activePlayer: PlayerEntity | null = null;
  private routeType = "default";
  private collectedNodes: RouteNode[] = [];

  private previewPath: fabric.Path | null = null;

  public onDrawingComplete?: (
    player: PlayerEntity,
    nodes: RouteNode[],
    routeType: string,
  ) => void;

  private stateListeners: ((isDrawing: boolean) => void)[] = [];

  constructor(
    private canvasManager: CanvasManager,
    private selectionManager: SelectionManager,
  ) {}

  /**
   * Frontend oder Engine können sich hier anmelden.
   */
  public onStateChange(callback: (isDrawing: boolean) => void): () => void {
    this.stateListeners.push(callback);

    callback(this.isDrawing);

    return () => {
      this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyStateChange(): void {
    this.stateListeners.forEach((listener) => listener(this.isDrawing));
  }

  /**
   * Startet den Zeichenmodus für den übergebenen Spieler.
   */
  public startDrawing(player: PlayerEntity, routeType = "default"): void {
    if (this.isDrawing) this.cancelDrawing();

    this.isDrawing = true;
    this.notifyStateChange();
    this.activePlayer = player;
    this.routeType = routeType;

    this.collectedNodes = [
      { x: player.x, y: player.y, type: SegmentType.STRAIGHT },
    ];

    this.toggleCanvasInteractions(false);
    this.bindEvents();
  }

  private bindEvents(): void {
    const canvas = this.canvasManager.getRawCanvas();

    canvas.on("mouse:move", this.handleMouseMove);
    canvas.on("mouse:down", this.handleMouseDown);
    canvas.on("mouse:dblclick", this.handleFinish);

    window.addEventListener("keydown", this.handleKeyDown);
  }

  private unbindEvents(): void {
    const canvas = this.canvasManager.getRawCanvas();

    canvas.off("mouse:move", this.handleMouseMove);
    canvas.off("mouse:down", this.handleMouseDown);
    canvas.off("mouse:dblclick", this.handleFinish);

    window.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleMouseMove = (options: any): void => {
    if (!this.isDrawing) return;

    const pointer = this.getPointer(options);
    if (!pointer) return;

    const tempNodes = [
      ...this.collectedNodes,
      { x: pointer.x, y: pointer.y, type: SegmentType.STRAIGHT },
    ];

    this.updatePreviewPath(tempNodes);
  };

  private handleMouseDown = (options: any): void => {
    if (!this.isDrawing) return;

    // Rechtsklick bricht das Zeichnen ab
    if (options.e && (options.e as MouseEvent).button === 2) {
      this.cancelDrawing();
      return;
    }

    const pointer = this.getPointer(options);
    if (!pointer) return;

    const lastNode = this.collectedNodes[this.collectedNodes.length - 1];
    const dist = Math.hypot(pointer.x - lastNode.x, pointer.y - lastNode.y);
    if (dist < 3) return;

    this.collectedNodes.push({
      x: pointer.x,
      y: pointer.y,
      type: SegmentType.STRAIGHT,
    });
  };

  private handleFinish = (): void => {
    if (!this.isDrawing || !this.activePlayer) return;

    if (this.collectedNodes.length >= 2) {
      const finalPlayer = this.activePlayer;
      const finalNodes = [...this.collectedNodes];
      const finalType = this.routeType;

      this.stopDrawing();

      if (this.onDrawingComplete) {
        this.onDrawingComplete(finalPlayer, finalNodes, finalType);
      }
    } else {
      this.cancelDrawing();
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.isDrawing) return;

    if (e.key === "Enter") {
      this.handleFinish();
    } else if (e.key === "Escape") {
      this.cancelDrawing();
    }
  };

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

    if (options.e) {
      const mouseEvent = options.e as MouseEvent;
      const canvas = this.canvasManager.getRawCanvas();

      if (typeof (canvas as any).getScenePoint === "function") {
        return (canvas as any).getScenePoint(mouseEvent);
      }
      if (typeof (canvas as any).getViewportPoint === "function") {
        return (canvas as any).getViewportPoint(mouseEvent);
      }
    }

    return null;
  }

  private updatePreviewPath(nodes: RouteNode[]): void {
    if (this.previewPath) {
      this.canvasManager.removeFabricObject(this.previewPath);
    }

    const svgString = generateSvgPathString(nodes);

    this.previewPath = new fabric.Path(svgString, {
      fill: "transparent",
      stroke: this.activePlayer?.color || "black",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    this.canvasManager.addFabricObject(this.previewPath);
    this.canvasManager.requestRender();
  }

  public cancelDrawing(): void {
    this.stopDrawing();
  }

  private stopDrawing(): void {
    if (this.previewPath) {
      this.canvasManager.removeFabricObject(this.previewPath);
      this.previewPath = null;
    }

    this.unbindEvents();
    this.toggleCanvasInteractions(true);

    this.isDrawing = false;
    this.notifyStateChange();
    this.activePlayer = null;
    this.collectedNodes = [];

    this.canvasManager.requestRender();
  }

  private toggleCanvasInteractions(enable: boolean): void {
    this.selectionManager.setInteractionsEnabled(enable);
  }
}
