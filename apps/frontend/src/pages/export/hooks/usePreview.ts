import { useMemo } from "react";
import type { PDFExportOptions } from "../../../types/interface"; // Pfad ggf. anpassen

interface PreviewGridCell {
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
}

export function usePreview(
  options: PDFExportOptions,
  containerHeightPx: number = 250, // Feste Höhe im Editor
) {
  return useMemo(() => {
    // Fallbacks, falls noch nichts eingegeben wurde
    const pageWidth = options.pageWidth || 297;
    const pageHeight = options.pageHeight || 210;
    const columns = options.columns || 1;
    const rows = options.rows || 1;
    const margin = options.margin || {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    };
    const gap = options.gap || 0;

    // 1. SCALE-FAKTOR berechnen (Pixel pro Millimeter)
    // Wenn das PDF 210mm hoch ist und der Container 250px hoch sein soll: 250 / 210 = 1.19 px/mm
    const scale = containerHeightPx / pageHeight;

    // 2. Blattgröße in Pixeln
    const paperWidthPx = pageWidth * scale;
    const paperHeightPx = pageHeight * scale;

    // 3. Nutzbare Fläche in Millimetern berechnen (exakt wie im ExportManager)
    const usableWidthMM =
      pageWidth - margin.left - margin.right - (columns - 1) * gap;
    const usableHeightMM =
      pageHeight - margin.top - margin.bottom - (rows - 1) * gap;

    const cellWidthMM = usableWidthMM / columns;
    const cellHeightMM = usableHeightMM / rows;

    // 4. Raster-Zellen berechnen (Position x/y und Breite/Höhe in Pixeln)
    const gridCells: PreviewGridCell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Koordinaten in MM
        const xMM = margin.left + col * (cellWidthMM + gap);
        const yMM = margin.top + row * (cellHeightMM + gap);

        // Umrechnen in Pixel mit dem Scale-Faktor
        gridCells.push({
          xPx: xMM * scale,
          yPx: yMM * scale,
          widthPx: cellWidthMM * scale,
          heightPx: cellHeightMM * scale,
        });
      }
    }

    // 5. Titel-Padding (1.5mm) in Pixel umrechnen
    const textPaddingPx = 1.5 * scale;
    // FontSize 5pt in Pixel umrechnen (1 pt = 0.3527 mm) -> 5 * 0.3527 * scale
    const fontSizePx = 5 * 0.3527 * scale;

    return {
      scale,
      paperWidthPx,
      paperHeightPx,
      gridCells,
      textPaddingPx,
      fontSizePx,
      // Reichen wir für den Titel (playbookTitle) oben auf der Seite durch
      titleXPx: margin.left * scale,
      titleYPx: (margin.top + 4) * scale, // Im Backend steht: margin.top + 4
    };
  }, [options, containerHeightPx]);
}
