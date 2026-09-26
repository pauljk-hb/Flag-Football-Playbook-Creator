import type { PlayerModel } from "@/entities/player/PlayerModel";
import type { RouteModel } from "@/entities/route/RouteModel";
import type { PlayModel } from "@/playModel/PlayModel";
import type { ICommand } from "../ICommand";

export class RemovePlayerCommand implements ICommand {
  private deletedPlayer: PlayerModel | null = null;
  private deletedRoutes: RouteModel[] = [];

  constructor(
    private playModel: PlayModel,
    private playerId: string,
  ) {
    const player = this.playModel.getPlayer(this.playerId);
    if (player) {
      this.deletedPlayer = player;
      this.deletedRoutes = [
        ...this.playModel.getRoutesFromPlayer(this.playerId),
      ];
    }
  }

  public execute(): void {
    if (!this.deletedPlayer) return;
    this.playModel.removePlayer(this.playerId);

    this.deletedRoutes.forEach((route) => {
      this.playModel.removeRoute(route.id);
    });
  }

  public undo(): void {
    if (!this.deletedPlayer) return;

    this.playModel.addPlayer(this.deletedPlayer);

    this.deletedRoutes.forEach((route) => {
      this.playModel.addRoute(route);
    });
  }
}
