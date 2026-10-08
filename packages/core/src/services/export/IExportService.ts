import type { PlayDTO } from "../../types";
import type { PDFExportOptions, ThumbnailOptions } from "../../types/export";

export interface IExportService {
  exportPlayAsImage(options?: ThumbnailOptions): string;

  exportPlaybookAsPDF(
    plays: (PlayDTO & { title?: string })[],
    options?: PDFExportOptions,
  ): Promise<Blob>;

  // exportFormationThumbnail(
  //   play: PlayImportData,
  //   options?: ImageExportOptions,
  // ): Promise<string>;
}
