import type { PlayModel } from "../../playModel/PlayModel";
import type { Point2D, RouteNode } from "../../types/domain";
import type { ICommand } from "../ICommand";

export class MovePlayerCommand implements ICommand {
  private dx: number;
  private dy: number;

  constructor(
    private playModel: PlayModel,
    private playerId: string,
    private startPosition: Point2D,
    private endPosition: Point2D,
  ) {
    this.dx = this.endPosition.x - this.startPosition.x;
    this.dy = this.endPosition.y - this.startPosition.y;
  }

  public execute(): void {
    const player = this.playModel.getPlayer(this.playerId);
    if (!player) return;

    const routes = this.playModel.getRoutesFromPlayer(this.playerId);

    routes.forEach((route) => {
      if (route.nodes.length > 0) {
        const firstNode = route.nodes[0];
        if (firstNode.position === player.position) {
          firstNode.position = { x: player.position.x, y: player.position.y };
        }
      }
    });

    player.position.x = this.endPosition.x;
    player.position.y = this.endPosition.y;

    routes.forEach((route) => {
      route.translate(this.dx, this.dy);
    });
  }

  public undo(): void {
    const player = this.playModel.getPlayer(this.playerId);
    if (!player) return;

    player.position.x = this.startPosition.x;
    player.position.y = this.startPosition.y;

    const routes = this.playModel.getRoutesFromPlayer(this.playerId);
    routes.forEach((route) => {
      route.nodes.forEach((node: RouteNode) => {
        node.position.x -= this.dx;
        node.position.y -= this.dy;

        if (node.cpIn) {
          node.cpIn.x -= this.dx;
          node.cpIn.y -= this.dy;
        }
        if (node.cpOut) {
          node.cpOut.x -= this.dx;
          node.cpOut.y -= this.dy;
        }
      });
    });
  }
}
