import type { jsPDF } from "jspdf";
import type { PDFExportOptions, PlayCell } from "../../../../types/export";
import type { IPDFTheme } from "./IPDFTheme";

export class ClassicGridTheme implements IPDFTheme {
  public render(
    doc: jsPDF,
    cells: PlayCell[],
    options: PDFExportOptions,
  ): void {
    const columns = options.columns || 4;
    const rows = options.rows || 3;
    const margin = options.margin || {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    };
    const gap = options.gap || 5;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    if (options.playbookTitle) {
      doc.setFontSize(14);
      doc.text(options.playbookTitle, margin.left, margin.top + 5);
    }

    const headerOffset = options.playbookTitle ? 10 : 0;

    const usableWidth =
      pageWidth - (margin.left + margin.right) - (columns - 1) * gap;
    const usableHeight =
      pageHeight -
      (margin.bottom + margin.top) -
      headerOffset -
      (rows - 1) * gap;

    const cellWidth = usableWidth / columns;
    const cellHeight = usableHeight / rows;

    const playsPerPage = columns * rows;

    cells.forEach((cell, index) => {
      const indexOnPage = index % playsPerPage;

      if (index > 0 && indexOnPage === 0) {
        doc.addPage();
        if (options.playbookTitle) {
          doc.setFontSize(14);
          doc.text(options.playbookTitle, margin.left, margin.top + 5);
        }
      }

      const col = indexOnPage % columns;
      const row = Math.floor(indexOnPage / columns);

      const xPos = margin.left + col * (cellWidth + gap);
      const yPos = margin.top + headerOffset + row * (cellHeight + gap);

      this.renderCell(doc, cell, xPos, yPos, cellWidth, cellHeight);
    });
  }

  private renderCell(
    doc: jsPDF,
    cell: PlayCell,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    doc.addImage(cell.imgData, "JPEG", x, y, w, h);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(x, y, w, h);

    doc.setFontSize(Math.max(6, h * 0.2));
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 0);
    doc.text(cell.title, x + 2, y + h - 2);
  }
}
