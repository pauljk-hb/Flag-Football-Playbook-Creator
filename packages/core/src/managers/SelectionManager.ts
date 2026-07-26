import type { BaseEntity } from "../entities/BaseEntity";
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
   * Gibt die ID der aktuell ausgewählten Route zurück.
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

  /**
   * Gibt die ID der aktuell ausgewählten Route zurück.
   */
  public getSelectedObject(): BaseEntity | null {
    const canvas = this.canvasManager.getRawCanvas();
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return null;

    const players = this.entityManager.getAllPlayers();

    let object: BaseEntity | undefined;

    object = players.find((p) => p.fabricObject === activeObject);

    if (object != undefined) return object;

    for (const player of players) {
      if (player.route && player.route.fabricObject === activeObject) {
        object = player.route;
      }
    }

    if (object != undefined) return object;

    return null;
  }
}
