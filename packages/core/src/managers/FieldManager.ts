// manager/FieldManager.ts
import { Canvas, FabricObject, Line } from "fabric";
import {
  SYSTEM_FIELDS,
  PIXELS_PER_YARD,
  DEFAULT_LOS_Y,
} from "../data/presets/fields";
import type { FieldLineConfig } from "../types/presets";
import type { CanvasManager } from "./CanvasManager";

export class FieldManager {
  private fieldObjects: FabricObject[] = [];

  private currentPresetId: string = "STANDARD";

  constructor(private canvasManager: CanvasManager) {}

  public getCurrentPresetId(): string {
    return this.currentPresetId;
  }

  public drawField(presetId: string): void {
    const preset = SYSTEM_FIELDS[presetId];
    if (!preset) return;

    this.currentPresetId = presetId;

    this.clearField();

    const LINE_START = -1000;
    const LINE_END = 5000;

    preset.lines.forEach((lineConfig: FieldLineConfig) => {
      const yPos = DEFAULT_LOS_Y - lineConfig.yardsFromLos * PIXELS_PER_YARD;

      let strokeColor = "#ffffff";
      let strokeWidth = 2;
      let dashArray: number[] | null = null;

      if (lineConfig.type === "los") {
        strokeColor = "#121212";
        strokeWidth = 4;
      } else if (lineConfig.type === "endzone") {
        strokeColor = "#ef4444";
        strokeWidth = 4;
      } else if (lineConfig.type === "yardline") {
        strokeColor = "#94a3b8";
        strokeWidth = 2;
        dashArray = [10, 5];
      }

      const fabricLine = new Line([LINE_START, yPos, LINE_END, yPos], {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: dashArray,
        selectable: false,
        evented: false,
        hoverCursor: "default",
      });

      this.fieldObjects.push(fabricLine);
      this.canvasManager.add(fabricLine);

      this.canvasManager.sendToBack(fabricLine);
    });
  }

  public clearField(): void {
    this.fieldObjects.forEach((obj) => this.canvasManager.remove(obj));
    this.fieldObjects = [];
  }
}
