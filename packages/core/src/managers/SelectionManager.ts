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
}
