import { PlayModel } from "../../playModel/PlayModel";
import { RenderService } from "../../rendering/RenderService";
import type { PlayDTO } from "../../types/domain";
import type {
  HeadlessEnvironment,
  PDFExportOptions,
  ThumbnailOptions,
} from "../../types/export";
import type { ThemeConfig } from "../../types/system";
import { EventBus } from "../events/EventBus";
import type { IExportService } from "./IExportService";
import { PDFPlaybookStrategy } from "./strategies/PDFPlaybookStrategy";

export class ExportService implements IExportService {
  constructor(
    private liveRenderService: RenderService,
    private livePlayModel: PlayModel,
    private themeConfig: ThemeConfig,
  ) {}

  /**
   * Generiert Image von einem einzelnen Play
   */
  public exportPlayAsImage(options: ThumbnailOptions = {}): string {
    return this.liveRenderService.generateThumbnail(options);
  }

  /**
   * Generiert ein komplettes PDF von einem Array von Plays.
   */
  public async exportPlaybookAsPDF(
    plays: PlayDTO[],
    options: PDFExportOptions,
  ): Promise<Blob> {
    const env = this.createHeadlessEnvironment(1920, 1080);
    try {
      return await new PDFPlaybookStrategy().execute(plays, env, options);
    } finally {
      env.destroy();
    }
  }

  private createHeadlessEnvironment(
    width: number,
    height: number,
  ): HeadlessEnvironment {
    const offScreenCanvas = document.createElement("canvas");
    offScreenCanvas.width = width;
    offScreenCanvas.height = height;

    const eventBus = new EventBus();
    const playState = new PlayModel();
    const themeConfig = this.themeConfig;

    // Der RenderService abonniert den EventBus und zeichnet auf das offScreenCanvas
    const renderService = new RenderService(
      offScreenCanvas,
      eventBus,
      playState,
    );

    return {
      renderService,
      playState,
      eventBus,
      themeConfig,
      width,
      height,
      destroy: () => {
        eventBus.clearAllListeners();
        offScreenCanvas.remove();
      },
    };
  }
}
