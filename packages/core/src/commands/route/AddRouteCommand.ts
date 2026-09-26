import { RouteModel } from "@/entities/route/RouteModel";
import type { PlayModel } from "@/playModel/PlayModel";
import { constrainRouteToCanvas } from "@/utils/geometry";
import type { ICommand } from "../ICommand";

export class AddRouteCommand implements ICommand {
  private newRoute: RouteModel;
  private previousRoute: RouteModel | null = null;

  constructor(
    private playModel: PlayModel,
    playerId: string,
    routeType: string,
    rawNodes: RouteNode[],
  ) {
    this.previousRoute =
      this.playModel.getRouteByPlayerAndType(playerId, routeType) || null;

    // 2. Erzeuge die finalen, sicheren Koordinaten
    const constrainedNodes = constrainRouteToCanvas(
      rawNodes,
      CANVAS_SIZE.width,
      CANVAS_SIZE.height,
    );

    const player = this.playModel.getPlayer(playerId);

    this.newRoute = new RouteModel({
      playerId: playerId,
      routeType: routeType,
      nodes: constrainedNodes,
      color: player?.color || "black",
    });
  }

  public execute(): void {
    if (this.previousRoute) {
      this.playModel.removeRoute(this.previousRoute.id);
    }
    this.playModel.addRoute(this.newRoute);
  }

  public undo(): void {
    this.playModel.removeRoute(this.newRoute.id);
    if (this.previousRoute) {
      this.playModel.addRoute(this.previousRoute);
    }
  }
}
