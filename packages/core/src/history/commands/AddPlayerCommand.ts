// history/commands/AddPlayerCommand.ts
import type { ICommand } from "../../types/history";
import type { PlayerEntity } from "../../entities/PlayerEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { EntityManager } from "../../managers/EntityManager";

export class AddPlayerCommand implements ICommand {
  constructor(
    private player: PlayerEntity,
    private canvasManager: CanvasManager,
    private entityManager: EntityManager,
  ) {}

  execute(): void {
    this.entityManager.addPlayerToMap(this.player);

    this.player.getFabricObjects().forEach((obj) => {
      this.canvasManager.add(obj);
    });
  }

  undo(): void {
    this.entityManager.removePlayerFromMap(this.player.id);

    this.player.getFabricObjects().forEach((obj) => {
      this.canvasManager.remove(obj);
    });

    if (this.player.route) {
      this.player.getFabricObjects().forEach((obj) => {
        this.canvasManager.remove(obj);
      });
    }
  }
}
