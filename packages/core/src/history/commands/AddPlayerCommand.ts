// history/commands/AddPlayerCommand.ts
import type { ICommand } from "../../types/history";
import { type PlayerConfig, PlayerEntity } from "../../entities/PlayerEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { PlayManager } from "../../managers/PlayManager";

export class AddPlayerCommand implements ICommand {
  private playerEntity: PlayerEntity;

  constructor(
    playerEntity: PlayerEntity,
    private canvasMngr: CanvasManager,
    private playMngr: PlayManager,
  ) {
    this.playerEntity = playerEntity;
  }

  execute(): void {
    this.playMngr.addEntity(this.playerEntity);
    this.canvasMngr.addEntity(this.playerEntity);
  }

  undo(): void {
    this.canvasMngr.removeEntity(this.playerEntity);
    this.playMngr.removeEntity(this.playerEntity.id);
  }
}
