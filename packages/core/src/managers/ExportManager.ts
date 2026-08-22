import type { PlayImportData } from "@/types/interfaces";
import { jsPDF } from "jspdf";
import { HistoryManager } from "../history/HistoryManager";
import type {
  GridLayout,
  HeadlessEnvironment,
  Margin,
  PDFExportOptions,
  PlayCell,
} from "../types/export";
import { CanvasManager } from "./CanvasManager";
import { FieldManager } from "./FieldManager";
import { NotificationManager } from "./NotificationManager";
import { PlayManager } from "./PlayManager";

export class ExportManager {
  public async generatePDF(
    plays: (PlayImportData & { title?: string })[],
    options: PDFExportOptions = {},
  ): Promise<Blob> {
    const {
      pageWidth = 135,
      pageHeight = 80,
      columns = 4,
      rows = 3,
      playbookTitle = "Playbook",
      margin = { top: 5, bottom: 8, left: 12, right: 12 },
      gap = 0,
    } = options;

    const layout = this.calculateGridLayout(
      pageWidth,
      pageHeight,
      columns,
      rows,
      margin,
      gap,
    );
    const headless = this.createHeadlessEnvironment(layout);

    const doc = new jsPDF({
      orientation: this.getOrientation(pageWidth, pageHeight),
      unit: "mm",
      format: [pageWidth, pageHeight],
    });

    const cells = this.generateCells(plays, headless);

    this.renderTable(doc, cells, columns, rows, layout);

    return doc.output("blob");
  }

  private getOrientation(
    pageWidth: number,
    pageHeight: number,
  ): "landscape" | "portrait" {
    return pageWidth > pageHeight ? "landscape" : "portrait";
  }

  /**
   * Berechnet dynamisch die Maße für die Grid-Zellen basierend auf Seiten- und Randeinstellungen.
   */
  private calculateGridLayout(
    pageWidth: number,
    pageHeight: number,
    columns: number,
    rows: number,
    margin: Margin,
    gap: number,
  ): GridLayout {
    const headerHeight = 0;
    const titleSpace = 0;

    const usableWidth =
      pageWidth - (margin.left + margin.right) - (columns - 1) * gap;
    const usableHeight =
      pageHeight -
      (margin.bottom + margin.top) -
      headerHeight -
      (rows - 1) * gap;

    const cellWidth = usableWidth / columns;
    const cellHeight = usableHeight / rows;

    return {
      cellWidth,
      cellHeight,
      imgWidth: cellWidth,
      imgHeight: cellHeight - titleSpace,
      titleSpace,
      headerHeight,
      margin,
      gap,
      pageWidth,
      pageHeight,
    };
  }

  /**
   * Erzeugt das isolierte Off-Screen Canvas und die zugehörigen Manager für den Export.
   */
  private createHeadlessEnvironment(layout: GridLayout): HeadlessEnvironment {
    const BASE_WIDTH = 1920;

    const aspectRatio = layout.imgWidth / layout.imgHeight;
    const calculatedHeight = Math.round(BASE_WIDTH / aspectRatio);

    const offScreenCanvas = document.createElement("canvas");
    offScreenCanvas.width = BASE_WIDTH;
    offScreenCanvas.height = calculatedHeight;

    const canvasManager = new CanvasManager();
    canvasManager.init(offScreenCanvas);

    const historyManager = new HistoryManager();
    const notificationManager = new NotificationManager();
    const fieldManager = new FieldManager(canvasManager);

    const playManager = new PlayManager(
      canvasManager,
      historyManager,
      fieldManager,
      notificationManager,
    );

    return {
      canvasManager,
      playManager,
      width: BASE_WIDTH,
      height: calculatedHeight,
    };
  }

  /**
   * Zeichnet Titel und Seitennummerierung oben auf die PDF-Seite.
   */
  private renderHeader(
    doc: jsPDF,
    title: string,
    currentPage: number,
    totalPages: number,
    layout: GridLayout,
  ): void {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(title, layout.margin.left, layout.margin.top + 4);

    doc.setFontSize(10);
    doc.text(
      `Seite ${currentPage} von ${totalPages}`,
      layout.pageWidth - layout.margin.right - 25,
      layout.margin.top + 4,
    );
  }

  private generateCells(
    plays: (PlayImportData & { title?: string })[],
    env: HeadlessEnvironment,
  ): PlayCell[] {
    const cells: PlayCell[] = [];

    for (let i = 0; i < plays.length; i++) {
      const play = plays[i];

      const rawCanvas = env.canvasManager.getRawCanvas();
      if (rawCanvas) {
        rawCanvas.backgroundColor = "#ffffff";
      }

      env.playManager.loadPlay(play);

      const imgData = env.canvasManager.generateThumbnail({
        width: env.width,
        format: "jpeg",
        quality: 0.85,
      });

      const title = play.title || `Play ${i + 1}`;
      cells.push({ title, imgData });

      env.playManager.clearPlay();
      env.canvasManager.clear();
    }

    return cells;
  }

  private renderTable(
    doc: jsPDF,
    cells: PlayCell[],
    columns: number,
    rows: number,
    layout: GridLayout,
  ): void {
    const playsPerPage = columns * rows;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const indexOnPage = i % playsPerPage;

      if (i > 0 && indexOnPage === 0) {
        doc.addPage();
      }

      const col = indexOnPage % columns;
      const row = Math.floor(indexOnPage / columns);

      const xPos = layout.margin.left + col * (layout.cellWidth + layout.gap);
      const yPos =
        layout.margin.top +
        layout.headerHeight +
        row * (layout.cellHeight + layout.gap);

      this.renderCell(
        doc,
        cell,
        xPos,
        yPos,
        layout.cellWidth,
        layout.cellHeight,
      );
    }
  }

  private renderCell(
    doc: jsPDF,
    cell: PlayCell,
    xPos: number,
    yPos: number,
    cellWidth: number,
    cellHeight: number,
  ): void {
    doc.addImage(cell.imgData, "JPEG", xPos, yPos, cellWidth, cellHeight);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(xPos, yPos, cellWidth, cellHeight);

    const calculatedFontSize = cellHeight * 0.25;
    const fontSize = Math.max(3, Math.min(calculatedFontSize, 12));
    const textPaddingX = 1.5;
    const textPaddingY = 1.5;

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bolditalic");

    const textX = xPos + textPaddingX;
    const textY = yPos + cellHeight - textPaddingY;

    doc.setTextColor(0, 0, 0);
    doc.text(cell.title, textX, textY);
  }
}
