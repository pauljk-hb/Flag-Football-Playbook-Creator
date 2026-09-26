import type { PlayImportData } from "../../../types/interfaces";
import type { HeadlessEnvironment, ImageExportOptions } from "../types";
import type { IExportStrategy } from "./IExportStrategy";

export class ImageThumbnailStrategy implements IExportStrategy<
  PlayImportData,
  ImageExportOptions
> {
  public async execute(
    play: PlayImportData,
    env: HeadlessEnvironment,
    options: ImageExportOptions,
  ): Promise<Blob> {
    const rawCanvas = env.canvasManager.getRawCanvas();
    if (rawCanvas) rawCanvas.backgroundColor = "#ffffff";

    env.playState.loadFromDTO(play);
    env.eventBus.emit("state:changed", { playState: env.playState });

    // Da Fabric.js synchron rendert, können wir das Bild direkt abziehen
    const imgData = env.canvasManager.generateThumbnail({
      width: env.width,
      format: "jpeg",
      quality: options.quality || 0.85,
    });

    env.playState.clearPlay();
    env.canvasManager.clear();

    // Base64 in Blob konvertieren
    const fetchResponse = await fetch(imgData);
    return await fetchResponse.blob();
  }
}
