import * as fabric from "fabric";
import type { FieldRenderer } from "../../entities/field/FieldRenderer";
import type { PlayerRenderer } from "../../entities/player/PlayerRenderer";
import type { RouteRenderer } from "../../entities/route/RouteRenderer";
import { CanvasManager } from "./CanvasManager";

export class LayerManager {
  constructor(private canvasManager: CanvasManager) {}

  public enforceLayering(
    fieldRenderer: FieldRenderer,
    routeRenderers: Map<string, RouteRenderer>,
    playerRenderers: Map<string, PlayerRenderer>,
  ): void {
    const canvas = this.canvasManager.getRawCanvas();

    const orderedObjects: fabric.Object[] = [];

    orderedObjects.push(...fieldRenderer.getFabricObjects());

    routeRenderers.forEach((renderer) => {
      orderedObjects.push(...renderer.getFabricObjects());
    });

    playerRenderers.forEach((renderer) => {
      orderedObjects.push(...renderer.getFabricObjects());
    });

    routeRenderers.forEach((renderer) => {
      orderedObjects.push(...renderer.getControlObjects());
    });

    orderedObjects.forEach((obj) => {
      canvas.bringObjectToFront(obj);
    });

    this.canvasManager.requestRender();
  }
}
