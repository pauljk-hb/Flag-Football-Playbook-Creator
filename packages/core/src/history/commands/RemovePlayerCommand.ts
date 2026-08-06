import type { PlayerEntity } from "../../entities/PlayerEntity";
import { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";

export class RemovePlayerCommand implements ICommand {
  private player: PlayerEntity;

  constructor(
    private playerId: string,
    private playMngr: PlayManager,
    private canvasMngr: CanvasManager,
  ) {
    this.player = this.playMngr.getEntity(this.playerId) as PlayerEntity;
  }

  execute(): void {
    if (!this.player) return;

    this.canvasMngr.removeEntity(this.player);
    this.playMngr.removeEntity(this.player.id);
  }

  undo(): void {
    if (!this.player) return;

    this.playMngr.addEntity(this.player);
    this.canvasMngr.addEntity(this.player);
  }
}
