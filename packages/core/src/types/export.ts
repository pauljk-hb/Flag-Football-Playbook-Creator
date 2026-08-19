import type { CanvasManager } from "@/managers/CanvasManager";
import type { PlayManager } from "@/managers/PlayManager";

export interface PDFExportOptions {
  pageWidth?: number;
  pageHeight?: number;
  columns?: number;
  rows?: number;
  playbookTitle?: string;
  margin?: Margin;
  gap?: number;
}

export interface Margin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface GridLayout {
  cellWidth: number;
  cellHeight: number;
  imgWidth: number;
  imgHeight: number;
  titleSpace: number;
  headerHeight: number;
  margin: Margin;
  gap: number;
  pageWidth: number;
  pageHeight: number;
}

export interface HeadlessEnvironment {
  canvasManager: CanvasManager;
  playManager: PlayManager;
  width: number;
  height: number;
}
