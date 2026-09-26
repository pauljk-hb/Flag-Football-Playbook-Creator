import { clampPositionWithinBounds, snapToCoordinate } from "@/utils/geometry";
import * as fabric from "fabric";
import { BaseRenderer } from "../base/BaseRenderer";
import type { PlayerModel } from "./PlayerModel";

export class PlayerRenderer extends BaseRenderer<PlayerModel> {
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  public render(model: PlayerModel): void {
    this.currentModel = model;

    let backgroundShape: any;

    if (model.style.shape === "square") {
      backgroundShape = new fabric.Rect({
        width: 32,
        height: 32,
        fill: model.color,
        originX: "center",
        originY: "center",
        rx: 6,
        ry: 6,
      });
    } else {
      backgroundShape = new fabric.Circle({
        radius: 16,
        fill: model.color,
        originX: "center",
        originY: "center",
      });
    }

    const labelText = model.style.showLabels !== false ? model.label : "";
    const text = new fabric.Text(labelText, {
      fontSize: 14,
      fill: "#ffffff",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
      fontFamily: "sans-serif",
    });

    this.fabricObject = new fabric.Group([backgroundShape, text], {
      left: model.x,
      top: model.y,
      hasControls: false,
      hasBorders: false,
      originX: "center",
      originY: "center",
    });

    (this.fabricObject as any).customData = {
      id: model.id,
      type: "PLAYER",
    };

    this.setupEvents();

    // CanvasManager abstrahiert hier den direkten fabric-Canvas Aufruf (z.B. this.canvas.add)
    this.canvasManager.addFabricObject(this.fabricObject);
  }

  public syncWithModel(model: PlayerModel): void {
    if (!this.fabricObject) return;

    this.currentModel = model;

    this.fabricObject.set({ left: model.x, top: model.y });

    const backgroundShape = this.fabricObject.item(0);
    backgroundShape.set("fill", model.color);

    const textObj = this.fabricObject.item(1);
    textObj.set("text", model.label);

    this.fabricObject.setCoords();
  }

  private setupEvents(): void {
    if (!this.fabricObject || !this.currentModel) return;

    this.fabricObject.on("mousedown", () => {
      this.dragStartX = this.fabricObject.left ?? 0;
      this.dragStartY = this.fabricObject.top ?? 0;
    });

    this.fabricObject.on("selected", () => {
      this.showControls();
    });

    this.fabricObject.on("deselected", () => {
      this.hideControls();
    });

    this.fabricObject.on("moving", () => {
      const SNAP_THRESHOLD = 20;

      let currentX = this.fabricObject.left ?? 0;
      let currentY = this.fabricObject.top ?? 0;

      currentY = snapToCoordinate(currentY, DEFAULT_LOS_Y, SNAP_THRESHOLD);

      const clamped = clampPositionWithinBounds(
        currentX,
        currentY,
        this.fabricObject.getScaledWidth(),
        this.fabricObject.getScaledHeight(),
        CANVAS_SIZE.width,
        CANVAS_SIZE.height,
        this.fabricObject.originX as string,
        this.fabricObject.originY as string,
      );

      this.fabricObject.set({
        left: clamped.x,
        top: clamped.y,
      });
    });

    this.fabricObject.on("modified", () => {
      const currentX = this.fabricObject.left ?? 0;
      const currentY = this.fabricObject.top ?? 0;

      if (this.dragStartX !== currentX || this.dragStartY !== currentY) {
        // Die visuelle Schicht feuert nun ein abstraktes Event an das System,
        // anstatt einen direkten Callback auszuführen.
        this.eventBus.emit("renderer:player_moved", {
          playerId: this.currentModel!.id,
          startX: this.dragStartX,
          startY: this.dragStartY,
          endX: currentX,
          endY: currentY,
        });
      }
    });
  }

  public setSelectable(enabled: boolean): void {
    if (this.fabricObject) {
      this.fabricObject.selectable = enabled;
      this.fabricObject.evented = enabled;
    }
  }

  public showControls(): void {
    if (!this.fabricObject) return;
    const shape = this.fabricObject.item(0);
    shape.set("strokeWidth", 4);
    shape.set("stroke", "#FFD700");
  }

  public hideControls(): void {
    if (!this.fabricObject) return;
    const shape = this.fabricObject.item(0);
    shape.set("strokeWidth", 0);
  }
}
