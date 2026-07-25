// history/commands/LoadFormationCommand.ts
import type { ICommand } from "../../types/history";
import type { FormationManager } from "../../managers/FormationManager";
import type { PlayerEntity } from "../../entities/PlayerEntity";

export class LoadFormationCommand implements ICommand {
  private previousPlayers: PlayerEntity[] = [];
  private newFormationPlayers: PlayerEntity[] = [];
  private isFirstExecution: boolean = true;

  constructor(
    private formationManager: FormationManager,
    private formationId: string,
    private customX?: number,
    private customY?: number,
  ) {}

  execute(): void {
    if (this.isFirstExecution) {
      this.previousPlayers = this.formationManager.getAllPlayers();

      this.formationManager.clearField();

      this.formationManager.loadFormation(
        this.formationId,
        this.customX,
        this.customY,
      );

      this.newFormationPlayers = this.formationManager.getAllPlayers();

      this.isFirstExecution = false;
    } else {
      this.formationManager.clearField();
      this.formationManager.restorePlayers(this.newFormationPlayers);
    }
  }

  undo(): void {
    this.formationManager.clearField();

    this.formationManager.restorePlayers(this.previousPlayers);
  }
}
