import type { PlayModel } from "../playModel/PlayModel";
import type { RenderService } from "../rendering/RenderService";
import type { EventBus } from "../services/events/EventBus";
import type { ThemeConfig } from "./system";

export interface PDFExportOptions {
  pageWidth?: number;
  pageHeight?: number;
  columns?: number;
  rows?: number;
  playbookTitle?: string;
  margin?: Margin;
  gap?: number;
}

export interface ThumbnailOptions {
  format?: "png" | "jpeg";
  quality?: number;
  width?: number;
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
  renderService: RenderService;
  playState: PlayModel;
  eventBus: EventBus;
  themeConfig: ThemeConfig;
  width: number;
  height: number;
  destroy: () => void;
}

export interface PlayCell {
  title: string;
  imgData: string;
}
