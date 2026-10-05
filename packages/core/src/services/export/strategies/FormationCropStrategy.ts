// import type { PlayDTO } from "@/types";
// import * as fabric from "fabric";
// import type { IExportStrategy } from "./IExportStrategy";
// import type { HeadlessEnvironment } from "@/types/export";

// export class FormationCropStrategy implements IExportStrategy<
//   PlayDTO,
//   ImageExportOptions,
//   string
// > {
//   public async execute(
//     play: PlayDTO,
//     env: HeadlessEnvironment,
//     options: ImageExportOptions,
//   ): Promise<string> {
//     env.playState.loadFromDTO(play);
//     env.eventBus.emit("play:updated", undefined);

//     const canvas = env.canvasManager.getRawCanvas();

//     canvas.getObjects().forEach((obj: any) => {
//       const meta = obj.customData;
//       if (!meta || meta.type !== "PLAYER") {
//         obj.visible = false;
//       }
//     });

//     const losLine = new fabric.Line(
//       [-1000, DEFAULT_LOS_Y, 10000, DEFAULT_LOS_Y],
//       {
//         stroke: "#121212",
//         strokeWidth: 4,
//       },
//     );
//     canvas.add(losLine);
//     canvas.sendToBack(losLine);

//     canvas.renderAll();

//     const cropTop = DEFAULT_LOS_Y - 120;
//     const cropHeight = 240;

//     const dataURL = canvas.toDataURL({
//       format: "png",
//       multiplier: 0.7,
//       left: 0,
//       top: cropTop,
//       width: canvas.width || 800,
//       height: cropHeight,
//     });

//     env.playState.clearPlay();
//     env.canvasManager.clear();

//     return dataURL;
//   }
// }
