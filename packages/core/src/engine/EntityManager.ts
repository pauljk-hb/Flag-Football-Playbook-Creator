import type { PlayerEntity } from '../entities/PlayerEntity';

export class EntityManager {
  private players: Map<string, PlayerEntity> = new Map();

  public addPlayer(player: PlayerEntity): void {
    this.players.set(player.id, player);
  }

  public removePlayer(id: string): void {
    this.players.delete(id);
  }

  public getPlayer(id: string): PlayerEntity | undefined {
    return this.players.get(id);
  }

  public getAllPlayers(): PlayerEntity[] {
    return Array.from(this.players.values());
  }

  public clear(): void {
    this.players.clear();
  }
}