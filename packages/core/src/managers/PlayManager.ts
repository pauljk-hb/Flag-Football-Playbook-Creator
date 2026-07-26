// manager/PlayManager.ts
import type { EntityManager } from "./EntityManager.js";
import type { CanvasManager } from "./CanvasManager.js";
import type { SavedPlay } from "../types/interfaces.js";
import type { ICommand } from "../types/history.js";
import { RouteEntity } from "../entities/RouteEntity.js";
import type { HistoryManager } from "../history/HistoryManager.js";

export class PlayManager {
  constructor(
    private entityManager: EntityManager,
    private canvasManager: CanvasManager,
    private historyManager: HistoryManager,
  ) {}

  /**
   * Nimmt den aktuellen Zustand des Feldes und speichert ihn in einem JSON-kompatiblen Objekt.
   */
  public savePlayData(): SavedPlay {
    const players = this.entityManager.getAllPlayers();

    return {
      players: players.map((player) => player.serialize()),
    };
  }

  /**
   * Lädt einen Spielzug. Setzt das Feld komplett zurück und baut es anhand der Daten neu auf.
   */
  public loadPlayData(
    savedPlay: SavedPlay,
    onCommand: (cmd: ICommand) => void,
  ): void {
    this.historyManager.clear();
    this.entityManager.clear();
    this.canvasManager.clear();

    for (const savedPlayer of savedPlay.players) {
      const player = this.entityManager.createPlayer(
        {
          id: savedPlayer.id,
          x: savedPlayer.x,
          y: savedPlayer.y,
          color: savedPlayer.color,
          label: savedPlayer.label,
          shape: savedPlayer.shape,
        },
        onCommand,
      );

      if (savedPlayer.route) {
        const route = new RouteEntity({
          id: savedPlayer.route.id,
          color: savedPlayer.route.color,
          points: savedPlayer.route.points,
        });
        route.onCommandGenerated = onCommand;

        // Verknüpfen
        player.route = route;
      }

      this.entityManager.addPlayerToMap(player);

      if (player.route) {
        player.route
          .getFabricObjects()
          .forEach((obj) => this.canvasManager.add(obj));
      }

      player.getFabricObjects().forEach((obj) => {
        this.canvasManager.add(obj);
        this.canvasManager.bringObjectToFront(obj);
      });
    }

    this.canvasManager.requestRender();
  }
}
