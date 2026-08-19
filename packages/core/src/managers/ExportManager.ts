import { jsPDF } from "jspdf";
import { HistoryManager } from "../history/HistoryManager";
import type {
  GridLayout,
  HeadlessEnvironment,
  Margin,
  PDFExportOptions,
} from "../types/export";
import type { PlayExportData } from "../types/interfaces";
import { CanvasManager } from "./CanvasManager";
import { FieldManager } from "./FieldManager";
import { NotificationManager } from "./NotificationManager";
import { PlayManager } from "./PlayManager";

export class ExportManager {
  public async generatePDF(
    plays: (PlayExportData & { title?: string })[],
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

    const playsPerPage = columns * rows;
    const layout = this.calculateGridLayout(
      pageWidth,
      pageHeight,
      columns,
      rows,
      margin,
      gap,
    );
    const headless = this.createHeadlessEnvironment(layout);

    console.log("layot, ", layout);

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [pageWidth, pageHeight],
    });

    for (let i = 0; i < plays.length; i++) {
      const play = plays[i];
      const indexOnPage = i % playsPerPage;

      console.log("page index", indexOnPage);

      if (i > 0 && indexOnPage === 0) {
        doc.addPage();
      }

      /*
      if (indexOnPage === 0) {
        const pageNum = Math.floor(i / playsPerPage) + 1;
        const totalPages = Math.ceil(plays.length / playsPerPage);
        this.renderHeader(doc, playbookTitle, pageNum, totalPages, layout);
      }
        */

      this.renderPlayCell(doc, play, i, indexOnPage, columns, layout, headless);
    }

    return doc.output("blob");
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

  /**
   * Rendert ein einzelnes Play im Off-Screen Canvas und stempelt Bild, Rahmen
   * sowie den Titel (oben aufliegend) in die Zelle.
   */
  private renderPlayCell(
    doc: jsPDF,
    play: PlayExportData & { title?: string },
    globalIndex: number,
    indexOnPage: number,
    columns: number,
    layout: GridLayout,
    env: HeadlessEnvironment,
  ): void {
    const col = indexOnPage % columns;
    const row = Math.floor(indexOnPage / columns);

    console.log(col, row, columns);

    const xPos = layout.margin.left + col * (layout.cellWidth + layout.gap);
    const yPos =
      layout.margin.top +
      layout.headerHeight +
      row * (layout.cellHeight + layout.gap);

    // 1. Canvas vorbereiten & Play rendern
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

    // 2. SCHRITT 1: Zuerst das Bild zeichnen (untere Ebene)
    doc.addImage(
      imgData,
      "JPEG",
      xPos,
      yPos,
      layout.cellWidth,
      layout.cellHeight,
    );

    // 3. SCHRITT 2: Schwarzer Rahmen um die Zelle
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(xPos, yPos, layout.cellWidth, layout.cellHeight);

    // 4. SCHRITT 3: Text ÜBER das Bild zeichnen (obere Ebene)
    const playTitle = play.title || `Play ${globalIndex + 1}`;
    const fontSize = 5;
    const textPaddingX = 2.5; // mm Abstand von links
    const textPaddingY = 2.5; // mm Abstand von unten

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bolditalic");

    const textX = xPos + textPaddingX;
    const textY = yPos + layout.cellHeight - textPaddingY;

    // Text stempeln
    doc.setTextColor(0, 0, 0);
    doc.text(playTitle, textX, textY);

    // 5. Aufräumen für das nächste Play
    env.playManager.clearPlay();
    env.canvasManager.clear();
  }
}
