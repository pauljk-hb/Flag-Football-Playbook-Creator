import type { BaseEntity } from "../entities/BaseEntity.js";
import { PlayerEntity } from "../entities/PlayerEntity.js";
import { RouteEntity } from "../entities/RouteEntity.js";
import type { HistoryManager } from "../history/HistoryManager.js";
import type {
  PlayerExportData,
  PlayExportData,
  RouteExportData,
} from "../types/interfaces.js";
import type { CanvasManager } from "./CanvasManager.js";
import type { FieldManager } from "./FieldManager.js";
import type { NotificationManager } from "./NotificationManager.js";

export class PlayManager {
  constructor(
    private canvasManager: CanvasManager,
    private historyManager: HistoryManager,
    private fieldManager: FieldManager,
    private notificationManager: NotificationManager,
  ) {}

  private entities: Map<string, BaseEntity> = new Map();

  /**
   * Fügt eine neue Entität zum aktuellen State hinzu.
   */
  public addEntity(entity: BaseEntity): void {
    if (this.entities.has(entity.id)) {
      this.notificationManager.sendFeedback(
        "warning",
        `Entity with ID ${entity.id} already exists. Overwriting.`,
      );
    }
    this.entities.set(entity.id, entity);
  }

  /**
   * Entfernt eine Entität aus dem State.
   */
  public removeEntity(id: string): void {
    this.entities.delete(id);
  }

  /**
   * Holt eine Entität anhand ihrer ID (z.B. für Commands, die eine Route hinzufügen wollen).
   */
  public getEntity<T extends BaseEntity>(id: string): T | undefined {
    return this.entities.get(id) as T | undefined;
  }

  /**
   * Gibt alle Entitäten als Array zurück (z.B. zum Speichern oder globalen Rendern).
   */
  public getAllEntities(): BaseEntity[] {
    return Array.from(this.entities.values());
  }

  public getAllRoutesFromPlayer(playerId: string): RouteEntity[] {
    return this.getAllEntities().filter((entity) => {
      if (entity instanceof RouteEntity) {
        return entity.playerId === playerId;
      }
      return false;
    }) as RouteEntity[];
  }

  /**
   * Sucht nach einer spezifischen Route eines Spielers (z.B. seine 'default' Route).
   */
  public getRouteByPlayerAndType(
    playerId: string,
    routeType: string,
  ): RouteEntity | undefined {
    const allEntities = this.getAllEntities();
    return allEntities.find(
      (entity): entity is RouteEntity =>
        entity instanceof RouteEntity &&
        entity.playerId === playerId &&
        entity.routeType === routeType,
    );
  }

  /**
   * Löscht den gesamten aktuellen State (z.B. beim Laden eines neuen Plays).
   */
  public clearPlay(): void {
    this.entities.clear();
  }

  /**
   * Nimmt den aktuellen Zustand des Feldes und speichert ihn in einem JSON-kompatiblen Objekt.
   */
  public exportPlay(): PlayExportData {
    const players: PlayerExportData[] = [];
    const routes: RouteExportData[] = [];

    this.entities.forEach((entity) => {
      if (entity instanceof PlayerEntity) {
        players.push({
          id: entity.id,
          x: entity.x,
          y: entity.y,
          label: entity.label,
          color: entity.color,
          shape: entity.shape,
        });
      } else if (entity instanceof RouteEntity) {
        routes.push({
          id: entity.id,
          playerId: entity.playerId,
          routeType: entity.routeType,
          color: entity.color,
          nodes: JSON.parse(JSON.stringify(entity.nodes)),
        });
      }
    });

    return {
      fieldPresetId: this.fieldManager.getCurrentPresetId() || "STANDARD",
      players,
      routes,
    };
  }

  /**
   * Lädt einen Spielzug. Setzt das Feld komplett zurück und baut es anhand der Daten neu auf.

  public loadPlayData(
    savedPlay: any,
    onCommand: (cmd: ICommand) => void,
  ): void {
    this.historyManager.clear();
    this.canvasManager.clear();

    console.log("load PLay with: ", savedPlay.fieldPresetId);

    this.fieldManager.drawField(savedPlay.fieldPresetId);

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
        */
}
