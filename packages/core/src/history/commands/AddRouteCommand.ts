import type { PlayerEntity } from "../../entities/PlayerEntity";
import type { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";

export class AddRouteCommand implements ICommand {
  private player: PlayerEntity;

  constructor(
    private newRouteEntity: RouteEntity,
    private playManager: PlayManager,
    private canvasManager: CanvasManager,
    private oldRouteEntity: RouteEntity | null = null,
  ) {
    this.player = this.playManager.getEntity(
      this.newRouteEntity.playerId,
    ) as PlayerEntity;
  }

  public execute(): void {
    if (this.oldRouteEntity) {
      this.canvasManager.removeEntity(this.oldRouteEntity);
      this.oldRouteEntity.destroyAllHandles();
      this.playManager.removeEntity(this.oldRouteEntity.id);
    }

    this.playManager.addEntity(this.newRouteEntity);
    this.canvasManager.addEntity(this.newRouteEntity);

    this.newRouteEntity.initializeControls(this.canvasManager.getRawCanvas());
    this.canvasManager.requestRender();
  }

  public undo(): void {
    this.canvasManager.removeEntity(this.newRouteEntity);
    this.newRouteEntity.destroyAllHandles();
    this.playManager.removeEntity(this.newRouteEntity.id);

    if (this.oldRouteEntity) {
      this.playManager.addEntity(this.oldRouteEntity);
      this.canvasManager.addEntity(this.oldRouteEntity);
      this.oldRouteEntity.initializeControls(this.canvasManager.getRawCanvas());
    }

    this.canvasManager.bringObjectToFront(this.player);
  }
}
