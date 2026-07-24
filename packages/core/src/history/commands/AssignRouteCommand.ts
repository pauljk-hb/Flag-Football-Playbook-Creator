import * as fabric from 'fabric';
import type { ICommand } from '../../types/history.js';
import type { PlayerEntity } from '../../entities/PlayerEntity.js';
import type { RouteEntity } from '../../entities/RouteEntity.js';

export class AssignRouteCommand implements ICommand {
  constructor(
    private player: PlayerEntity,
    private newRoute: RouteEntity,
    private oldRoute: RouteEntity | null,
    private canvas: fabric.Canvas
  ) {}

  public execute(): void {
    this.player.setRoute(this.newRoute, this.canvas);
    this.canvas.requestRenderAll();
  }

  public undo(): void {
    if (this.oldRoute) {
      this.player.setRoute(this.oldRoute, this.canvas);
    } else {
      this.player.removeRoute(this.canvas);
    }
    this.canvas.requestRenderAll();
  }
}