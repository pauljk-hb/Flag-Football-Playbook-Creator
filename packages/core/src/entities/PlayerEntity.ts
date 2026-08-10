// entities/PlayerEntity.ts
import * as fabric from "fabric";
import { BaseEntity } from "./BaseEntity.js";
import {
  clampPositionWithinBounds,
  snapToCoordinate,
} from "../utils/geometry.js";
import { DEFAULT_LOS_Y } from "../data/presets/fields.js";
import { CANVAS_SIZE } from "../managers/CanvasManager.js";

export interface PlayerConfig {
  id?: string;
  x: number;
  y: number;
  label: string;
  color: string;
  shape: "circle" | "square";
}

export class PlayerEntity extends BaseEntity {
  public fabricGroup: fabric.Group;

  public label: string;
  public color: string;
  public shape: "circle" | "square";

  public onMoveComplete?: (
    playerId: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) => void;

  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor(config: PlayerConfig) {
    super(config.id);
    this.label = config.label;
    this.color = config.color;
    this.shape = config.shape;

    let backgroundShape: fabric.Object;

    if (config.shape === "square") {
      backgroundShape = new fabric.Rect({
        width: 32,
        height: 32,
        fill: config.color,
        originX: "center",
        originY: "center",
        rx: 6,
        ry: 6,
      });
    } else {
      backgroundShape = new fabric.Circle({
        radius: 16,
        fill: config.color,
        originX: "center",
        originY: "center",
      });
    }

    const text = new fabric.Text(config.label, {
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

      const canvas = this.fabricGroup.canvas;
      if (!canvas) return;

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

      // --- 3. WERTE ZURÜCKSCHREIBEN ---
      // Überschreibt die Mausposition mit den berechneten Limits
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
   * Wird vom MovePlayerCommand aufgerufen, wenn der Spieler bewegt wird.
   */
  public setPosition(x: number, y: number): void {
    this.fabricGroup.set({ left: x, top: y });
    this.fabricGroup.setCoords(); // Wichtig für Fabric, um die Hitbox upzudaten
  }

  /**
   * Setzt eine neue Farbe.
   */
  public setColor(newColor: string): void {
    this.color = newColor;
    const circle = this.fabricGroup.item(0) as fabric.Circle;
    if (circle) {
      circle.set("fill", newColor);
    }
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
}
