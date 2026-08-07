import type { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";

export class RemoveRouteCommand implements ICommand {
  private route: RouteEntity;

  constructor(
    private routeId: string,
    private playMngr: PlayManager,
    private canvasMngr: CanvasManager,
  ) {
    this.route = this.playMngr.getEntity(this.routeId) as RouteEntity;
  }

  execute(): void {
    if (this.route) {
      this.route.destroyAllHandles();
      this.canvasMngr.removeEntity(this.route);
      this.playMngr.removeEntity(this.route.id);
    }
  }

  undo(): void {
    if (this.route) {
      this.route.initializeControls(this.canvasMngr.getRawCanvas());
      this.playMngr.addEntity(this.route);
      this.canvasMngr.addEntity(this.route);
    }
  }
}
