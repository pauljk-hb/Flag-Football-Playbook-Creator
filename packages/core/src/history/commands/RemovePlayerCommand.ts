import type { ICommand } from "../../types/history.js";
import type { PlayerEntity } from "../../entities/PlayerEntity.js";
import * as fabric from "fabric";
import type { EntityManager } from "../../manager/EntityManager.js";

export class RemovePlayerCommand implements ICommand {
  constructor(
    private player: PlayerEntity,
    private canvas: fabric.Canvas,
    private entityManager: EntityManager,
  ) {}

  public execute(): void {
    this.entityManager.removePlayer(this.player.id);
    this.player.removeFromCanvas(this.canvas);
    this.canvas.requestRenderAll();
  }

  public undo(): void {
    this.entityManager.addPlayer(this.player);
    this.player.addToCanvas(this.canvas);
    this.canvas.requestRenderAll();
  }
}
