import type {
  PlayerExportData,
  PlayerImportData,
  PlayerStyle,
  PlayerStyleOverride,
} from "@/types/interfaces.js";
import * as fabric from "fabric";
import { DEFAULT_LOS_Y } from "../data/presets/fields.js";
import { CANVAS_SIZE } from "../managers/CanvasManager.js";
import {
  clampPositionWithinBounds,
  snapToCoordinate,
} from "../utils/geometry.js";
import { BaseEntity } from "./BaseEntity.js";

export class PlayerEntity extends BaseEntity {
  public fabricGroup: fabric.Group;

  private role: string;
  private style: PlayerStyle;
  private styleOverride: PlayerStyleOverride;

  public onMoveComplete?: (
    playerId: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) => void;

  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor(config: PlayerImportData) {
    super(config.id);
    this.role = config.role;
    this.style = config.style;
    this.styleOverride = config.styleOverride || {};

    let backgroundShape: fabric.Object;

    if (config.style.shape === "square") {
      backgroundShape = new fabric.Rect({
        width: 32,
        height: 32,
        fill: config.style.color,
        originX: "center",
        originY: "center",
        rx: 6,
        ry: 6,
      });
    } else {
      backgroundShape = new fabric.Circle({
        radius: 16,
        fill: config.style.color,
        originX: "center",
        originY: "center",
      });
    }

    const labelText = config.style.showLabels !== false ? this.style.label : "";
    const text = new fabric.Text(labelText, {
      fontSize: 14,
      fill: "#ffffff",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
      fontFamily: "sans-serif",
    });

    this.fabricGroup = new fabric.Group([backgroundShape, text], {
      left: config.x,
      top: config.y,
      hasControls: false,
      hasBorders: false,
      originX: "center",
      originY: "center",
    });

    this.fabricGroup.set("id" as any, this.id);
    this.setupEvents();
  }

  public get color(): string {
    return this.styleOverride.color ?? this.style.color;
  }

  public set color(newColor: string) {
    this.style.color = newColor;
    this.styleOverride.color = newColor;

    const backgroundShape = this.fabricGroup.item(0);
    backgroundShape.set("fill", newColor);
  }

  public get label(): string {
    return this.styleOverride.label ?? this.style.label;
  }

  public set label(newLabel: string) {
    this.style.label = newLabel;
    this.styleOverride.label = newLabel;

    const textObj = this.fabricGroup.item(1) as fabric.Text;
    textObj.set("text", newLabel);
  }

  public get x(): number {
    return this.fabricGroup.left ?? 0;
  }

  public get y(): number {
    return this.fabricGroup.top ?? 0;
  }

  private setupEvents(): void {
    this.fabricGroup.on("mousedown", () => {
      this.dragStartX = this.fabricGroup.left ?? 0;
      this.dragStartY = this.fabricGroup.top ?? 0;
    });

    this.fabricGroup.on("selected", () => {
      this.showControls();
    });

    this.fabricGroup.on("deselected", () => {
      this.hideControls();
    });

    this.fabricGroup.on("moving", () => {
      const SNAP_THRESHOLD = 20;

      let currentX = this.fabricGroup.left ?? 0;
      let currentY = this.fabricGroup.top ?? 0;

      currentY = snapToCoordinate(currentY, DEFAULT_LOS_Y, SNAP_THRESHOLD);

      const clamped = clampPositionWithinBounds(
        currentX,
        currentY,
        this.fabricGroup.getScaledWidth(),
        this.fabricGroup.getScaledHeight(),
        CANVAS_SIZE.width,
        CANVAS_SIZE.height,
        this.fabricGroup.originX as string,
        this.fabricGroup.originY as string,
      );

      this.fabricGroup.set({
        left: clamped.x,
        top: clamped.y,
      });
    });

    this.fabricGroup.on("modified", () => {
      const currentX = this.fabricGroup.left ?? 0;
      const currentY = this.fabricGroup.top ?? 0;

      if (this.dragStartX !== currentX || this.dragStartY !== currentY) {
        if (this.onMoveComplete) {
          this.onMoveComplete(
            this.id,
            this.dragStartX,
            this.dragStartY,
            currentX,
            currentY,
          );
        }
      }
    });
  }

  /**
   * Zwingend von BaseEntity gefordert:
   * Gibt alle Fabric-Objekte zurück, die der CanvasManager zeichnen muss.
   */
  public getFabricObjects(): fabric.Object[] {
    return [this.fabricGroup];
  }

  /**
   * Steuert, ob der Spieler auf dem Canvas angeklickt/bewegt werden darf.
   */
  public setSelectable(enabled: boolean): void {
    if (this.fabricGroup) {
      this.fabricGroup.selectable = enabled;
      this.fabricGroup.evented = enabled;
    }
  }

  /**
   * Wird vom MovePlayerCommand aufgerufen, wenn der Spieler bewegt wird.
   */
  public setPosition(x: number, y: number): void {
    this.fabricGroup.set({ left: x, top: y });
    this.fabricGroup.setCoords();
  }

  /**
   * Wird aufgerufen, wenn das Objekt selektiert wird
   */
  public showControls(): void {
    const circle = this.fabricGroup.item(0) as fabric.Circle;
    circle.set("strokeWidth", 4);
    circle.set("stroke", "#FFD700");
  }

  public hideControls(): void {
    const circle = this.fabricGroup.item(0) as fabric.Circle;
    circle.set("strokeWidth", 0);
  }

  public serialize(): PlayerExportData {
    const currentX = this.fabricGroup
      ? this.fabricGroup.left || this.x
      : this.x;
    const currentY = this.fabricGroup ? this.fabricGroup.top || this.y : this.y;

    const exportData: PlayerExportData = {
      id: this.id,
      role: this.role,
      x: currentX,
      y: currentY,
    };

    if (this.styleOverride && Object.keys(this.styleOverride).length > 0) {
      exportData.styleOverride = { ...this.styleOverride };
    }

    return exportData;
  }
}
