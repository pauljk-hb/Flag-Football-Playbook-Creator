import type { RouteEntity } from "../entities/RouteEntity";
import type { CanvasManager } from "./CanvasManager";
import type { EntityManager } from "./EntityManager";

export class SelectionManager {
  constructor(
    private canvasManager: CanvasManager,
    private entityManager: EntityManager,
  ) {}

  /**
   * Gibt die ID des aktuell ausgewählten Spielers zurück.
   */
  public getSelectedPlayerId(): string | null {
    const canvas = this.canvasManager.getRawCanvas();
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return null;

    const player = this.entityManager
      .getAllPlayers()
      .find((p) => p.fabricObject === activeObject);

    return player ? player.id : null;
  }

  /**
   * Gibt die ID des aktuell ausgewählten Spielers zurück.
   */
  public getSelectedRouteId(): string | null {
    const canvas = this.canvasManager.getRawCanvas();
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return null;

    const players = this.entityManager.getAllPlayers();
    let route: RouteEntity | null = null;

    for (const player of players) {
      if (player.route && player.route.fabricObject === activeObject) {
        route = player.route;
      }
    }

    if (route === undefined) return null;
    return route!.id;
  }
}
