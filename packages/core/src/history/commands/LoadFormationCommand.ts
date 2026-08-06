import { PlayerEntity } from "../../entities/PlayerEntity";
import { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";
import type { PlayerSpawnData } from "../../types/presets";

export class LoadFormationCommand implements ICommand {
  private previousPlayers: PlayerEntity[] = [];
  private newPlayers: PlayerEntity[] = [];

  constructor(
    private spawnData: PlayerSpawnData[],
    private playManager: PlayManager,
    private canvasManager: CanvasManager,
  ) {}

  public execute(): void {
    this.previousPlayers = this.playManager
      .getAllEntities()
      .filter((e) => e instanceof PlayerEntity) as PlayerEntity[];

    this.playManager.getAllEntities().forEach((entity) => {
      this.canvasManager.removeEntity(entity);
      if (entity instanceof RouteEntity) {
        entity.destroyAllHandles();
      }
    });
    this.playManager.clearPlay();

    this.spawnData.forEach((data) => {
      const player = new PlayerEntity({
        x: data.x,
        y: data.y,
        label: data.label,
        color: data.color,
        shape: data.shape,
      });

      this.playManager.addEntity(player);
      this.canvasManager.addEntity(player);
      this.newPlayers.push(player);
    });

    this.canvasManager.requestRender();
  }

  public undo(): void {
    // 1. Die eben geladenen Spieler wieder entfernen
    this.newPlayers.forEach((player) => {
      this.canvasManager.removeEntity(player);
      this.playManager.removeEntity(player.id);
    });

    // 2. Die alten Spieler (und ihre Routen) wiederherstellen (alte Logik aus restorePlayers)
    this.previousPlayers.forEach((player) => {
      this.playManager.addEntity(player);
      this.canvasManager.addEntity(player);

      // Falls der Spieler Routen hatte, diese wieder aufs Feld holen
      const playerRoutes = this.playManager.getAllRoutesFromPlayer(player.id);
      playerRoutes.forEach((route) => {
        this.canvasManager.addEntity(route);
        route.initializeControls(this.canvasManager.getRawCanvas());
        // Route optisch unter den Spieler schieben
        route
          .getFabricObjects()
          .forEach((obj) => this.canvasManager.sendToBack(obj));
      });
    });

    this.canvasManager.requestRender();
  }
}
