// import type { PlayDTO } from "@/types";
// import type { HeadlessEnvironment } from "@/types/export";
// import type { IExportStrategy } from "./IExportStrategy";

// export class ImageThumbnailStrategy implements IExportStrategy<
//   PlayDTO,
//   ImageExportOptions
// > {
//   public async execute(
//     play: PlayDTO,
//     env: HeadlessEnvironment,
//     options: ImageExportOptions,
//   ): Promise<Blob> {
//     const rawCanvas = env.renderService.getRawCanvas();
//     if (rawCanvas) rawCanvas.backgroundColor = "#ffffff";

//     env.playState.loadFromDTO(play);
//     env.eventBus.emit("state:changed", { playState: env.playState });

//     // Da Fabric.js synchron rendert, können wir das Bild direkt abziehen
//     const imgData = env.renderService.generateThumbnail({
//       width: env.width,
//       format: "jpeg",
//       quality: options.quality || 0.85,
//     });

//     env.playState.clearPlay();
//     env.renderService.dispose();

//     // Base64 in Blob konvertieren
//     const fetchResponse = await fetch(imgData);
//     return await fetchResponse.blob();
//   }
// }
