import type { PlayerEntity } from "../../entities/PlayerEntity";
import { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";
import type { RouteNode } from "../../types/interfaces";

export class AddRouteCommand implements ICommand {
  private newRouteEntity: RouteEntity;
  private oldRouteEntity: RouteEntity | null = null;

  /**
   * @param playerId Die ID des Spielers, dem die Route gehören soll
   * @param routeType z.B. 'main', 'option', 'alt'
   * @param rawNodes Die vom Frontend oder Preset gelieferten rohen Knoten
   */
  constructor(
    private playerId: string,
    private routeType: string,
    private rawNodes: RouteNode[],
    private playMngr: PlayManager,
    private canvasMngr: CanvasManager,
  ) {
    const allEntities = this.playMngr.getAllEntities();
    this.oldRouteEntity =
      allEntities.find(
        (e): e is RouteEntity =>
          e instanceof RouteEntity &&
          e.playerId === this.playerId &&
          e.routeType === this.routeType,
      ) || null;

    const player = this.playMngr.getEntity<PlayerEntity>(this.playerId);
    const routeColor = player ? player.color : "#000000";

    this.newRouteEntity = new RouteEntity({
      playerId,
      nodes: this.rawNodes,
      color: routeColor,
      routeType,
    });
  }

  public execute(): void {
    if (this.oldRouteEntity) {
      this.oldRouteEntity.destroyAllHandles();
      this.canvasMngr.removeEntity(this.oldRouteEntity);
      this.playMngr.removeEntity(this.oldRouteEntity.id);
    }

    this.playMngr.addEntity(this.newRouteEntity);
    this.canvasMngr.addEntity(this.newRouteEntity);
    this.newRouteEntity.initializeControls(this.canvasMngr.getRawCanvas());

    this.canvasMngr.requestRender();
  }

  public undo(): void {
    this.newRouteEntity.destroyAllHandles();
    this.canvasMngr.removeEntity(this.newRouteEntity);
    this.playMngr.removeEntity(this.newRouteEntity.id);

    if (this.oldRouteEntity) {
      this.playMngr.addEntity(this.oldRouteEntity);
      this.canvasMngr.addEntity(this.oldRouteEntity);
      this.oldRouteEntity.initializeControls(this.canvasMngr.getRawCanvas());
    }

    this.canvasMngr.requestRender();
  }
}
