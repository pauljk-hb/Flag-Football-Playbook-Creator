import { PlayerModel } from "../../entities/player/PlayerModel";
import { RouteModel } from "../../entities/route/RouteModel";
import type { PlayModel } from "../../playModel/PlayModel";
import type { ICommand } from "../../types/history";
import type { ThemeConfig } from "../../types/system";
import type { FormationSpawnData } from "../../utils/FormationBuilder";

export class LoadFormationCommand implements ICommand {
  private previousPlayers: PlayerModel[] = [];
  private previousRoutes: RouteModel[] = [];
  private newPlayers: PlayerModel[] = [];

  constructor(
    private playModel: PlayModel,
    spawnData: Array<FormationSpawnData & { id?: string }>,
    theme: ThemeConfig,
  ) {
    this.previousPlayers = [...this.playModel.getAllPlayers()];
    this.previousRoutes = [...this.playModel.getAllRoutes()];

    this.newPlayers = spawnData.map((data) => new PlayerModel(data, theme));
  }

  public execute(): void {
    this.playModel.clearPlay();

    this.newPlayers.forEach((player) => {
      this.playModel.addPlayer(player);
    });
  }

  public undo(): void {
    this.playModel.clearPlay();

    this.previousPlayers.forEach((player) => {
      this.playModel.addPlayer(player);
    });

    this.previousRoutes.forEach((route) => {
      this.playModel.addRoute(route);
    });
  }
}
