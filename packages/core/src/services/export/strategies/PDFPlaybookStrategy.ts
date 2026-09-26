import { jsPDF } from "jspdf";
import type { HeadlessEnvironment, PDFExportOptions, PlayCell } from "../types";
import type { IExportStrategy } from "./IExportStrategy";
import { ClassicGridTheme } from "./themes/ClassicGridTheme";
// import { ModernHeaderTheme } from "./themes/ModernHeaderTheme";
import type { PlayImportData } from "../../../types/interfaces";
import type { IPDFTheme } from "./themes/IPDFTheme";

export class PDFPlaybookStrategy implements IExportStrategy<
  (PlayImportData & { title?: string })[],
  PDFExportOptions
> {
  public async execute(
    plays: (PlayImportData & { title?: string })[],
    env: HeadlessEnvironment,
    options: PDFExportOptions,
  ): Promise<Blob> {
    const pageWidth = options.pageWidth || 297;
    const pageHeight = options.pageHeight || 210;

    const doc = new jsPDF({
      orientation: pageWidth > pageHeight ? "landscape" : "portrait",
      unit: "mm",
      format: [pageWidth, pageHeight],
    });

    const cells = await this.generateCells(plays, env);
    const theme = this.getTheme(options.themeType);

    theme.render(doc, cells, options);

    return doc.output("blob");
  }

  private getTheme(type?: string): IPDFTheme {
    switch (type) {
      // case "MODERN": return new ModernHeaderTheme();
      case "CLASSIC":
      default:
        return new ClassicGridTheme();
    }
  }

  private async generateCells(
    plays: (PlayImportData & { title?: string })[],
    env: HeadlessEnvironment,
  ): Promise<PlayCell[]> {
    const cells: PlayCell[] = [];
    const { playState, eventBus, canvasManager, width } = env;

    for (let i = 0; i < plays.length; i++) {
      const play = plays[i];

      const rawCanvas = canvasManager.getRawCanvas();
      if (rawCanvas) rawCanvas.backgroundColor = "#ffffff";

      playState.loadFromDTO(play);
      eventBus.emit("state:changed", { playState });

      const imgData = canvasManager.generateThumbnail({
        width: width,
        format: "jpeg",
        quality: 0.85,
      });

      const title = play.title || `Play ${i + 1}`;
      cells.push({ title, imgData });

      playState.clearPlay();
      canvasManager.clear();
    }

    return cells;
  }
}
