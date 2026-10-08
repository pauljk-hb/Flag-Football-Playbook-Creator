import { PlayerModel } from "../../entities/player/PlayerModel";
import type { PlayModel } from "../../playModel/PlayModel";
import type { PlayerDTO } from "../../types/domain";
import type { ICommand } from "../../types/history";
import type { ThemeConfig } from "../../types/system";

export class AddPlayerCommand implements ICommand {
  private player: PlayerModel;

  constructor(
    private playModel: PlayModel,
    config: Omit<PlayerDTO, "id">,
    theme: ThemeConfig,
  ) {
    this.player = new PlayerModel(config, theme);
  }

  execute(): void {
    this.playModel.addPlayer(this.player);
  }

  undo(): void {
    this.playModel.removePlayer(this.player.id);
  }
}
