import type { PlayModel } from "@/playModel/PlayModel";
import type { ICommand } from "../ICommand";

export class MoveRouteNodeCommand implements ICommand {
  constructor(
    private playModel: PlayModel,
    private routeId: string,
    private oldNodes: RouteNode[],
    private newNodes: RouteNode[],
  ) {}

  public execute(): void {
    const route = this.playModel.getRoute(this.routeId);
    if (!route) return;

    route.nodes = JSON.parse(JSON.stringify(this.newNodes));
  }

  public undo(): void {
    const route = this.playModel.getRoute(this.routeId);
    if (!route) return;

    route.nodes = JSON.parse(JSON.stringify(this.oldNodes));
  }
}
