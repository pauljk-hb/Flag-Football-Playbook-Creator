import * as fabric from "fabric";
import type { CanvasManager } from "./CanvasManager";
import type { PlayerEntity } from "../entities/PlayerEntity";
import { type RouteNode, SegmentType } from "../types/interfaces";
import { generateSvgPathString } from "../utils/PathUtils";

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

  constructor(private canvasManager: CanvasManager) {}

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

    // Objekte auf dem Canvas sperren, damit man sie beim Klicken nicht verschiebt
    this.toggleCanvasInteractions(false);
    this.bindEvents();
  }

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

  // ==========================================
  // EVENT HANDLER
  // ==========================================

  private handleMouseMove = (options: any): void => {
    if (!this.isDrawing) return;

    // Zeigerposition aus dem Fabric Event holen
    const pointer = this.getPointer(options);
    if (!pointer) return;

    // Temporäres Array: Feste Punkte + aktuelle Mausposition
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

    // Prüfen: Wenn der Klick fast identisch mit dem letzten Node ist, Doppel-Klick abwarten/ignorieren
    const lastNode = this.collectedNodes[this.collectedNodes.length - 1];
    const dist = Math.hypot(pointer.x - lastNode.x, pointer.y - lastNode.y);
    if (dist < 3) return;

    // Neuen Punkt hinzufügen
    this.collectedNodes.push({
      x: pointer.x,
      y: pointer.y,
      type: SegmentType.STRAIGHT,
    });
  };

  private handleFinish = (): void => {
    if (!this.isDrawing || !this.activePlayer) return;

    // Wir brauchen mindestens Node 0 (Spieler) + 1 Zielpunkt
    if (this.collectedNodes.length >= 2) {
      const finalPlayer = this.activePlayer;
      const finalNodes = [...this.collectedNodes];
      const finalType = this.routeType;

      this.stopDrawing();

      // Übergeben an die PlaybookEngine
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

  // ==========================================
  // HELPER & RENDERING
  // ==========================================

  private getPointer(options: any): { x: number; y: number } | null {
    if (options.scenePoint) {
      return { x: options.scenePoint.x, y: options.scenePoint.y };
    }
    if (options.viewportPoint) {
      return { x: options.viewportPoint.x, y: options.viewportPoint.y };
    }

    // Fallback für ältere Fabric v5 Instanzen oder manuelle Native-Events
    if (options.pointer) {
      return options.pointer;
    }

    if (options.e) {
      const mouseEvent = options.e as MouseEvent;
      const canvas = this.canvasManager.getRawCanvas();

      // Falls v6 Methoden auf der Canvas-Instanz existieren:
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
    const canvas = this.canvasManager.getRawCanvas();

    if (this.previewPath) {
      canvas.remove(this.previewPath);
    }

    const svgString = generateSvgPathString(nodes);

    this.previewPath = new fabric.Path(svgString, {
      fill: "transparent",
      stroke: this.activePlayer?.color || "black",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    canvas.add(this.previewPath);
    this.canvasManager.requestRender();
  }

  public cancelDrawing(): void {
    this.stopDrawing();
  }

  private stopDrawing(): void {
    const canvas = this.canvasManager.getRawCanvas();

    if (this.previewPath) {
      canvas.remove(this.previewPath);
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
    const canvas = this.canvasManager.getRawCanvas();
    canvas.selection = enable;

    canvas.forEachObject((obj) => {
      obj.selectable = enable;
    });
  }
}
