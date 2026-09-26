import type { PlayModel } from "@/playModel/PlayModel";
import { PlayerModel } from "../../entities/player/PlayerModel";
import type { ICommand } from "../../types/history";

export class AddPlayerCommand implements ICommand {
  private player: PlayerModel;

  constructor(
    private playModel: PlayModel,
    config: PlayerConfig,
  ) {
    this.player = new PlayerModel(config);
  }

  execute(): void {
    this.playModel.addPlayer(this.player);
  }

  undo(): void {
    this.playModel.removePlayer(this.player.id);
  }
}
