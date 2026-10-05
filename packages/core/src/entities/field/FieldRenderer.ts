import * as fabric from "fabric";
import { FOOTBALL_METRICS } from "../../constants/constants";
import type { CanvasManager } from "../../rendering/canvas/CanvasManager";
import type { FieldModel } from "./FieldModel";

export class FieldRenderer {
  private fieldObjects: fabric.FabricObject[] = [];
  private renderedPresetId: string | null = null;

  constructor(private canvasManager: CanvasManager) {}

  /**
   * Synchronisiert das Canvas mit dem aktuellen Stand des FieldModels.
   */
  public syncWithModel(model: FieldModel): void {
    const targetPresetId = model.getPresetId();

    if (
      this.renderedPresetId === targetPresetId &&
      this.fieldObjects.length > 0
    ) {
      return;
    }

    this.clearField();
    this.renderedPresetId = targetPresetId;

    const LINE_START = -1000;
    const LINE_END = 5000;

    model.getLines().forEach((lineConfig) => {
      const yPos =
        FOOTBALL_METRICS.DEFAULT_LOS_Y -
        lineConfig.yardsFromLos * FOOTBALL_METRICS.PIXELS_PER_YARD;

      let strokeColor = "#ffffff";
      let strokeWidth = 2;
      let dashArray: number[] | undefined = undefined;

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

      const fabricLine = new fabric.Line([LINE_START, yPos, LINE_END, yPos], {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: dashArray,
        selectable: false, // Kann vom Nutzer nicht angeklickt werden
        evented: false, // Blockiert keine Klicks
        hoverCursor: "default",
      });

      this.fieldObjects.push(fabricLine);
      this.canvasManager.addFabricObject(fabricLine);
    });
  }

  public getFabricObjects(): fabric.Object[] {
    return this.fieldObjects;
  }

  public clearField(): void {
    this.fieldObjects.forEach((obj) =>
      this.canvasManager.removeFabricObject(obj),
    );
    this.fieldObjects = [];
    this.renderedPresetId = null;
  }
}
