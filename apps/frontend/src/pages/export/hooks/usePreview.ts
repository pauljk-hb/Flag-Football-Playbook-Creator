import { useMemo } from "react";
import type { PDFExportOptions } from "../../../types/interface";

interface PreviewGridCell {
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
}

export function usePreview(
  options: PDFExportOptions,
  containerHeightPx: number = 250,
) {
  return useMemo(() => {
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

    const scale = containerHeightPx / pageHeight;

    const paperWidthPx = pageWidth * scale;
    const paperHeightPx = pageHeight * scale;

    const usableWidthMM =
      pageWidth - margin.left - margin.right - (columns - 1) * gap;
    const usableHeightMM =
      pageHeight - margin.top - margin.bottom - (rows - 1) * gap;

    const cellWidthMM = usableWidthMM / columns;
    const cellHeightMM = usableHeightMM / rows;

    const gridCells: PreviewGridCell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const xMM = margin.left + col * (cellWidthMM + gap);
        const yMM = margin.top + row * (cellHeightMM + gap);

        gridCells.push({
          xPx: xMM * scale,
          yPx: yMM * scale,
          widthPx: cellWidthMM * scale,
          heightPx: cellHeightMM * scale,
        });
      }
    }

    const textPaddingPx = 1.5 * scale;
    const fontSizePx = 5 * 0.3527 * scale;

    return {
      scale,
      paperWidthPx,
      paperHeightPx,
      gridCells,
      textPaddingPx,
      fontSizePx,
      titleXPx: margin.left * scale,
      titleYPx: (margin.top + 4) * scale,
    };
  }, [options, containerHeightPx]);
}
