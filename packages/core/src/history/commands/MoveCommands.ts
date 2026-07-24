import type { ICommand } from '../../types/history.js';
import type { PlayerEntity } from '../../entities/PlayerEntity.js';
import type { RouteEntity } from '../../entities/RouteEntity.js';

export class MovePlayerCommand implements ICommand {
  constructor(
    private player: PlayerEntity,
    private startPos: { x: number; y: number },
    private endPos: { x: number; y: number }
  ) {}

  public execute(): void {
    this.player.setPosition(this.endPos.x, this.endPos.y);
  }

  public undo(): void {
    this.player.setPosition(this.startPos.x, this.startPos.y);
  }
}

export class MoveRouteCommand implements ICommand {
  constructor(
    private route: RouteEntity,
    private oldPoints: { x: number; y: number }[],
    private newPoints: { x: number; y: number }[]
  ) {}

  public execute(): void {
    this.route.updatePoints(this.newPoints);
  }

  public undo(): void {
    this.route.updatePoints(this.oldPoints);
  }
}