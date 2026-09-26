import type { PlayModel } from "@/playModel/PlayModel";
import type { ICommand } from "../ICommand";

export class MovePlayerCommand implements ICommand {
  private dx: number;
  private dy: number;

  constructor(
    private playModel: PlayModel,
    private playerId: string,
    private startX: number,
    private startY: number,
    private endX: number,
    private endY: number,
  ) {
    this.dx = this.endX - this.startX;
    this.dy = this.endY - this.startY;
  }

  public execute(): void {
    const player = this.playModel.getPlayer(this.playerId);
    if (!player) return;

    player.x = this.endX;
    player.y = this.endY;

    const routes = this.playModel.getRoutesFromPlayer(this.playerId);
    routes.forEach((route) => {
      route.nodes.forEach((node) => {
        node.x += this.dx;
        node.y += this.dy;
        if (node.cpInX !== undefined) node.cpInX += this.dx;
        if (node.cpInY !== undefined) node.cpInY += this.dy;
      });
    });
  }

  public undo(): void {
    const player = this.playModel.getPlayer(this.playerId);
    if (!player) return;

    player.x = this.startX;
    player.y = this.startY;

    const routes = this.playModel.getRoutesFromPlayer(this.playerId);
    routes.forEach((route) => {
      route.nodes.forEach((node) => {
        node.x -= this.dx;
        node.y -= this.dy;
        if (node.cpInX !== undefined) node.cpInX -= this.dx;
        if (node.cpInY !== undefined) node.cpInY -= this.dy;
      });
    });
  }
}
