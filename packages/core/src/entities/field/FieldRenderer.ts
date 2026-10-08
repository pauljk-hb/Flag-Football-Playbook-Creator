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
    const lines = model.getLines();

    const endzoneLines = lines.filter((l) => l.type === "endzone");
    if (endzoneLines.length === 2) {
      // Y-Koordinaten der beiden Linien berechnen
      const y1 =
        FOOTBALL_METRICS.DEFAULT_LOS_Y -
        endzoneLines[0].yardsFromLos * FOOTBALL_METRICS.PIXELS_PER_YARD;
      const y2 =
        FOOTBALL_METRICS.DEFAULT_LOS_Y -
        endzoneLines[1].yardsFromLos * FOOTBALL_METRICS.PIXELS_PER_YARD;

      const topY = Math.min(y1, y2);
      const height = Math.abs(y1 - y2);

      console.log(y1, y2, topY, height);

      const endzoneRect = new fabric.Rect({
        left: LINE_START,
        top: topY,
        width: LINE_END - LINE_START,
        height: height,
        fill: this.createEndzonePattern(),
        selectable: false,
        evented: false,
        hoverCursor: "default",
        originX: "left",
        originY: "top",
      });

      // Wir fügen das Rechteck ZUERST hinzu, damit es visuell UNTER den Linien liegt
      this.fieldObjects.push(endzoneRect);
      this.canvasManager.addFabricObject(endzoneRect);
    }

    lines.forEach((lineConfig) => {
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
        selectable: false,
        evented: false,
        hoverCursor: "default",
      });

      this.fieldObjects.push(fabricLine);
      this.canvasManager.addFabricObject(fabricLine);
    });
  }

  /**
   * Generiert ein nahtlos kachelbares 45-Grad Streifenmuster
   */
  private createEndzonePattern(): fabric.Pattern {
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 40;
    patternCanvas.height = 40;
    const ctx = patternCanvas.getContext("2d");

    if (ctx) {
      // Optional: Ein extrem heller roter Hintergrund (auskommentieren für transparent)
      // ctx.fillStyle = "rgba(239, 68, 68, 0.03)";
      // ctx.fillRect(0, 0, 40, 40);

      ctx.strokeStyle = "rgba(239, 68, 68, 0.25)";
      ctx.lineWidth = 10;
      ctx.beginPath();

      ctx.moveTo(0, 40);
      ctx.lineTo(40, 0);

      ctx.moveTo(-10, 10);
      ctx.lineTo(10, -10);
      ctx.moveTo(30, 50);
      ctx.lineTo(50, 30);

      ctx.stroke();
    }

    return new fabric.Pattern({
      source: patternCanvas,
      repeat: "repeat",
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
