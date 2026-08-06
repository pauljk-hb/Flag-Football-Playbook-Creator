import type { BaseEntity } from "../entities/BaseEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { RouteEntity } from "../entities/RouteEntity";
import type { CanvasManager } from "./CanvasManager";
import type { PlayManager } from "./PlayManager";
import * as fabric from "fabric";

export class SelectionManager {
  constructor(
    private canvasManager: CanvasManager,
    private playManager: PlayManager,
  ) {}

  /**
   * Initialisiert alle Klick- und Auswahl-Events auf dem Canvas.
   * Muss einmalig nach der Canvas-Initialisierung aufgerufen werden.
   */
  public setupSelectionEvents(): void {
    const canvas = this.canvasManager.getRawCanvas();

    const handleSelection = (e: fabric.IEvent) => {
      if (!e.selected || e.selected.length === 0) return;
      const activeObject = e.selected[0];

      if (activeObject.get("isRouteHandle" as keyof fabric.Object)) {
        const parentRouteId = activeObject.get(
          "parentRouteId" as keyof fabric.Object,
        ) as string;
        if (parentRouteId) {
          const route = this.playManager.getEntity(parentRouteId);
          if (route instanceof RouteEntity) {
            route.showControls();
            this.canvasManager.requestRender();
          }
        }
        return; // Jetzt können wir sicher abbrechen
      }

      // Wenn es kein Handle war, alles verstecken und neu auswerten
      this.hideAllRouteControls();

      const entityId = activeObject.get("id" as keyof fabric.Object) as string;
      if (!entityId) return;

      const entity = this.playManager.getEntity(entityId);

      if (entity instanceof RouteEntity) {
        entity.showControls();
      } else if (entity instanceof PlayerEntity) {
        const allEntities = this.playManager.getAllEntities();
        allEntities.forEach((ent) => {
          if (ent instanceof RouteEntity && ent.playerId === entity.id) {
            ent.showControls();
          }
        });
      }

      this.canvasManager.requestRender();
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);

    canvas.on("selection:cleared", () => {
      this.hideAllRouteControls();
      this.canvasManager.requestRender();
    });
  }

  private hideAllRouteControls(): void {
    // Nimmt an, dass PlayManager eine Methode hat, um alle Entitäten zu bekommen
    // Falls sie bei dir anders heißt, bitte anpassen (z.B. getEntities())
    const allEntities = this.playManager.getAllEntities();

    for (const entity of allEntities) {
      if (entity instanceof RouteEntity) {
        entity.hideControls();
      }
    }
  }

  /**
   * Gibt die ID des aktuell ausgewählten Entity zurück.
   */
  public getSelectedObject(): BaseEntity | null {
    const canvas = this.canvasManager.getRawCanvas();
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return null;

    const entityId = activeObject.get("id" as any) as string;

    if (!entityId) return null;

    const entity = this.playManager.getEntity(entityId);

    return entity ?? null;
  }
}
