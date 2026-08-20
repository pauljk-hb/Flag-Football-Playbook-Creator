import type { PlayerEntity } from "../../entities/PlayerEntity";
import type { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { NotificationManager } from "../../managers/NotificationManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";

export class RemoveRouteCommand implements ICommand {
  private route: RouteEntity;
  private player: PlayerEntity;

  constructor(
    private routeId: string,
    private playMngr: PlayManager,
    private canvasMngr: CanvasManager,
    private notificationManager: NotificationManager,
  ) {
    this.route = this.playMngr.getEntity(this.routeId) as RouteEntity;
    this.player = this.playMngr.getEntity(this.route.playerId) as PlayerEntity;

    if (!this.route) {
      this.notificationManager.sendFeedback(
        "warning",
        "Es ist keine Route ausgewählt!",
      );
      return;
    }
  }

  execute(): void {
    this.route.destroyAllHandles();
    this.canvasMngr.removeEntity(this.route);
    this.playMngr.removeEntity(this.route.id);
  }

  undo(): void {
    this.route.initializeControls(this.canvasMngr.getRawCanvas());
    this.playMngr.addEntity(this.route);
    this.canvasMngr.addEntity(this.route);
    this.canvasMngr.bringObjectToFront(this.player);
  }
}
