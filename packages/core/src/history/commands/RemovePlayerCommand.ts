import { NotificationManager } from "../../managers/NotificationManager";
import type { PlayerEntity } from "../../entities/PlayerEntity";
import { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";

export class RemovePlayerCommand implements ICommand {
  private player: PlayerEntity;
  private routes: RouteEntity[];

  constructor(
    private playerId: string,
    private playMngr: PlayManager,
    private canvasMngr: CanvasManager,
    private notificationManager: NotificationManager,
  ) {
    this.player = this.playMngr.getEntity(this.playerId) as PlayerEntity;
    this.routes = this.playMngr.getAllRoutesFromPlayer(this.playerId);
  }

  execute(): void {
    if (!this.player) {
      this.notificationManager.sendFeedback(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );
      return;
    }

    this.routes.forEach((route) => {
      route.destroyAllHandles();
      this.canvasMngr.removeEntity(route);
      this.playMngr.removeEntity(route.id);
    });

    this.canvasMngr.removeEntity(this.player);
    this.playMngr.removeEntity(this.player.id);
  }

  undo(): void {
    if (!this.player) {
      this.notificationManager.sendFeedback(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );
      return;
    }

    this.routes.forEach((route) => {
      route.initializeControls(this.canvasMngr.getRawCanvas());
      this.playMngr.addEntity(route);
      this.canvasMngr.addEntity(route);
    });

    this.playMngr.addEntity(this.player);
    this.canvasMngr.addEntity(this.player);
  }
}
