import type { RouteModel } from "../../entities/route/RouteModel";
import type { PlayModel } from "../../playModel/PlayModel";
import type { ICommand } from "../ICommand";

export class RemoveRouteCommand implements ICommand {
  private deletedRoute: RouteModel | null = null;

  constructor(
    private playModel: PlayModel,
    private routeId: string,
  ) {
    const route = this.playModel.getRoute(this.routeId);
    if (route) {
      this.deletedRoute = route;
    }
  }

  public execute(): void {
    if (!this.deletedRoute) return;
    this.playModel.removeRoute(this.routeId);
  }

  public undo(): void {
    if (!this.deletedRoute) return;
    this.playModel.addRoute(this.deletedRoute);
  }
}
