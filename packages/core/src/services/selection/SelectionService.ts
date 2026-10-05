import * as fabric from "fabric";
import type { SelectionItem } from "../../types/system";
import type { EventBus } from "../events/EventBus";

export class SelectionService {
  private boundHandleSelection = this.handleSelection.bind(this);
  private boundHandleCleared = this.handleCleared.bind(this);
  private boundHandleMouseDown = this.handleMouseDown.bind(this);

  constructor(
    private canvas: fabric.Canvas,
    private eventBus: EventBus,
  ) {}

  /**
   * Aktiviert das Lauschen auf Klicks.
   * Wird von der Engine aufgerufen, wenn der Standard-Modus aktiv ist.
   */
  public enable(): void {
    this.canvas.on("selection:created", this.boundHandleSelection);
    this.canvas.on("selection:updated", this.boundHandleSelection);
    this.canvas.on("selection:cleared", this.boundHandleCleared);
    this.canvas.on("mouse:down", this.boundHandleMouseDown);
  }

  /**
   * Deaktiviert den Sensor komplett (z.B. wenn man in den Zeichenmodus wechselt).
   */
  public disable(): void {
    this.canvas.off("selection:created", this.boundHandleSelection);
    this.canvas.off("selection:updated", this.boundHandleSelection);
    this.canvas.off("selection:cleared", this.boundHandleCleared);
    this.canvas.off("mouse:down", this.boundHandleMouseDown);
    this.clearCurrentSelection();
  }

  private handleSelection(e: any): void {
    if (!e.selected || e.selected.length === 0) return;

    const items: SelectionItem[] = [];

    e.selected.forEach((activeObject: fabric.Object) => {
      const id = activeObject.entityId;
      const type = activeObject.entityType;
      const parentId = activeObject.parentId;

      if (id && type) {
        items.push({
          id: id,
          type: type,
          parentId: parentId,
        });
      }
    });

    if (items.length > 0) {
      this.eventBus.emit("selection:changed", items);
    }
  }

  private handleCleared(): void {
    this.eventBus.emit("selection:cleared", undefined);
  }

  private handleMouseDown(e: any): void {
    if (!e.target) {
      this.clearCurrentSelection();

      if (e.scenePoint) {
        this.eventBus.emit("canvas:clicked", {
          x: e.scenePoint.x,
          y: e.scenePoint.y,
        });
      }
    }
  }

  public clearCurrentSelection(): void {
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.handleCleared();
  }
}
