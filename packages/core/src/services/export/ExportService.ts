import type { IExportService } from "./IExportService";
import { ImageThumbnailStrategy } from "./strategies/ImageThumbnailStrategy";
import { PDFPlaybookStrategy } from "./strategies/PDFPlaybookStrategy";
import type {
  HeadlessEnvironment,
  ImageExportOptions,
  PDFExportOptions,
} from "./types";

import { PlayModel } from "../../playModel/PlayModel";
import { CanvasManager } from "../../rendering/canvas/CanvasManager";
import { RenderService } from "../../rendering/RenderService";
import type { PlayImportData } from "../../types/interfaces";
import { EventBus } from "../events/EventBus";

export class ExportService implements IExportService {
  private createHeadlessEnvironment(
    width: number,
    height: number,
  ): HeadlessEnvironment {
    const offScreenCanvas = document.createElement("canvas");
    offScreenCanvas.width = width;
    offScreenCanvas.height = height;

    const eventBus = new EventBus();
    const canvasManager = new CanvasManager();
    canvasManager.init(offScreenCanvas);

    const playState = new PlayModel();

    // Der RenderService abonniert den EventBus und zeichnet auf das offScreenCanvas
    const renderService = new RenderService(canvasManager, eventBus);

    return {
      canvasManager,
      playState,
      eventBus,
      width,
      height,
      destroy: () => {
        canvasManager.clear();
        eventBus.clearAllListeners();
        offScreenCanvas.remove();
      },
    };
  }

  public async exportPlaybookAsPDF(
    plays: (PlayImportData & { title?: string })[],
    options?: PDFExportOptions,
  ): Promise<Blob> {
    const env = this.createHeadlessEnvironment(1920, 1080);
    const strategy = new PDFPlaybookStrategy();

    try {
      return await strategy.execute(plays, env, options || {});
    } finally {
      env.destroy();
    }
  }

  public async exportPlayAsImage(
    play: PlayImportData,
    options?: ImageExportOptions,
  ): Promise<Blob> {
    const env = this.createHeadlessEnvironment(
      options?.width || 1920,
      options?.height || 1080,
    );
    const strategy = new ImageThumbnailStrategy();

    try {
      return await strategy.execute(play, env, options || {});
    } finally {
      env.destroy();
    }
  }
}
