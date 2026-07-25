// manager/EntityManager.ts
import { PlayerEntity, type PlayerConfig } from "../entities/PlayerEntity";
import { RouteFactory } from "../factories/RouteFactory";
import { SYSTEM_ROUTES } from "../data/presets/routes";
import type { ICommand } from "../types/history";
import type { CanvasManager } from "./CanvasManager";

export class EntityManager {
  private players: Map<string, PlayerEntity> = new Map();

  constructor(private canvasManager: CanvasManager) {}

  public createPlayer(
    config: PlayerConfig,
    onCommand: (cmd: ICommand) => void,
  ): PlayerEntity {
    const player = new PlayerEntity(config, this.canvasManager);
    player.onCommandGenerated = onCommand;
    return player;
  }

  public createRoute(
    playerId: string,
    routePresetId: string,
    onCommand: (cmd: ICommand) => void,
  ) {
    const player = this.getPlayer(playerId);
    if (!player) return null;

    const routePreset = SYSTEM_ROUTES[routePresetId];
    if (!routePreset) return null;

    const route = RouteFactory.createFromPreset(
      player.x,
      player.y,
      routePreset,
      player.color,
    );
    route.onCommandGenerated = onCommand;
    return route;
  }

  public addPlayerToMap(player: PlayerEntity): void {
    this.players.set(player.id, player);
  }

  public removePlayerFromMap(id: string): void {
    this.players.delete(id);
  }

  public getPlayer(id: string): PlayerEntity | undefined {
    return this.players.get(id);
  }

  public getAllPlayers(): PlayerEntity[] {
    return Array.from(this.players.values());
  }

  public clear(): void {
    this.players.clear();
  }
}
