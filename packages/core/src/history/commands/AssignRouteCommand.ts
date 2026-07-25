// history/commands/AssignRouteCommand.ts
import type { ICommand } from "../../types/history";
import type { PlayerEntity } from "../../entities/PlayerEntity";
import type { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";

export class AssignRouteCommand implements ICommand {
  constructor(
    private player: PlayerEntity,
    private newRoute: RouteEntity | null,
    private oldRoute: RouteEntity | null,
    private canvasManager: CanvasManager,
  ) {}

  execute(): void {
    if (this.oldRoute) {
      this.oldRoute.getFabricObjects().forEach((obj) => {
        this.canvasManager.remove(obj);
      });
    }

    this.player.route = this.newRoute;

    if (this.newRoute) {
      this.newRoute.getFabricObjects().forEach((obj) => {
        this.canvasManager.add(obj);
      });

      this.player.getFabricObjects().forEach((obj) => {
        this.canvasManager.bringObjectToFront(obj);
      });
    }
  }

  undo(): void {
    if (this.newRoute) {
      this.newRoute.getFabricObjects().forEach((obj) => {
        this.canvasManager.remove(obj);
      });
    }

    this.player.route = this.oldRoute;

    if (this.oldRoute) {
      this.oldRoute.getFabricObjects().forEach((obj) => {
        this.canvasManager.add(obj);
      });

      this.player.getFabricObjects().forEach((obj) => {
        this.canvasManager.bringObjectToFront(obj);
      });
    }
  }
}
