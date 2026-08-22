import type { PlayerImportData } from "@/types/interfaces";
import { PlayerEntity } from "../../entities/PlayerEntity";
import { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { NotificationManager } from "../../managers/NotificationManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";
import type { HistoryManager } from "../HistoryManager";
import { MovePlayerCommand } from "./MoveCommands";

export class LoadFormationCommand implements ICommand {
  private previousPlayers: PlayerEntity[] = [];
  private newPlayers: PlayerEntity[] = [];

  constructor(
    private spawnData: PlayerImportData[],
    private playManager: PlayManager,
    private canvasManager: CanvasManager,
    private historyManager: HistoryManager,
    private notificationManager: NotificationManager,
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
      const player = new PlayerEntity(data);

      player.onMoveComplete = (playerId, startX, startY, endX, endY) => {
        const command = new MovePlayerCommand(
          playerId,
          startX,
          startY,
          endX,
          endY,
          this.playManager,
          this.canvasManager,
          this.notificationManager,
        );

        this.historyManager.execute(command);
      };

      this.playManager.addEntity(player);
      this.canvasManager.addEntity(player);
      this.newPlayers.push(player);
    });

    this.canvasManager.requestRender();
  }

  public undo(): void {
    this.newPlayers.forEach((player) => {
      this.canvasManager.removeEntity(player);
      this.playManager.removeEntity(player.id);
    });

    this.previousPlayers.forEach((player) => {
      this.playManager.addEntity(player);
      this.canvasManager.addEntity(player);

      const playerRoutes = this.playManager.getAllRoutesFromPlayer(player.id);
      playerRoutes.forEach((route) => {
        this.canvasManager.addEntity(route);
        route.initializeControls(this.canvasManager.getRawCanvas());
        route
          .getFabricObjects()
          .forEach((obj) => this.canvasManager.sendToBack(obj));
      });
    });

    this.canvasManager.requestRender();
  }
}
