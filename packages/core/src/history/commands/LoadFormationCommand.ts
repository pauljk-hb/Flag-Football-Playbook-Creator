import type { ICommand } from '../../types/history.js';
import type { FormationManager } from '../../manager/FormationManager.js';
import type { PlayerEntity } from '../../entities/PlayerEntity.js';

export class LoadFormationCommand implements ICommand {
  private previousPlayers: PlayerEntity[] = [];
    private formationPlayers: PlayerEntity[] = [];

  constructor(
    private formationManager: FormationManager,
    private formationId: string,
    private customX?: number,
    private customY?: number
  ) {}

  public execute(): void {
    if (this.previousPlayers.length === 0 && this.formationPlayers.length === 0) {
      this.previousPlayers = this.formationManager.getAllPlayers();
    }

    this.formationManager.clearAllPlayers();

    this.formationManager.applyFormationData(this.formationId, this.customX, this.customY);
    
    this.formationPlayers = this.formationManager.getAllPlayers();
  }

  public undo(): void {
    this.formationManager.clearAllPlayers();

    if (this.previousPlayers.length > 0) {
      this.formationManager.restorePlayers(this.previousPlayers);
    }
  }
}