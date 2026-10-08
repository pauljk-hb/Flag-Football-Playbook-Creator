import type { jsPDF } from "jspdf";
import type { PDFExportOptions, PlayCell } from "../../../../types/export";

export interface IPDFTheme {
  render(doc: jsPDF, cells: PlayCell[], options: PDFExportOptions): void;
}
