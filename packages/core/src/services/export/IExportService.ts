export interface IExportService {
  exportPlaybookAsPDF(
    plays: (PlayImportData & { title?: string })[],
    options?: PDFExportOptions,
  ): Promise<Blob>;

  exportPlayAsImage(
    play: PlayImportData,
    options?: ImageExportOptions,
  ): Promise<Blob>;
}
