import { PlayerModel } from "@/entities/player/PlayerModel";
import { RouteModel } from "@/entities/route/RouteModel";

export class PlayModel {
  private players: Map<string, PlayerModel> = new Map();
  private routes: Map<string, RouteModel> = new Map();

  public fieldPresetId: string = "STANDARD";

  /**
   * Spieler-Verwaltung
   */
  public addPlayer(player: PlayerModel): void {
    if (this.players.has(player.id)) {
      console.warn(`Player with ID ${player.id} already exists. Overwriting.`);
    }
    this.players.set(player.id, player);
  }

  public removePlayer(id: string): void {
    this.players.delete(id);
  }

  public getPlayer(id: string): PlayerModel | undefined {
    return this.players.get(id);
  }

  public getAllPlayers(): PlayerModel[] {
    return Array.from(this.players.values());
  }

  /**
   * Routen-Verwaltung
   */
  public addRoute(route: RouteModel): void {
    this.routes.set(route.id, route);
  }

  public removeRoute(id: string): void {
    this.routes.delete(id);
  }

  public getRoute(id: string): RouteModel | undefined {
    return this.routes.get(id);
  }

  public getAllRoutes(): RouteModel[] {
    return Array.from(this.routes.values());
  }

  public getRoutesFromPlayer(playerId: string): RouteModel[] {
    return this.getAllRoutes().filter((route) => route.playerId === playerId);
  }

  public getRouteByPlayerAndType(
    playerId: string,
    routeType: string,
  ): RouteModel | undefined {
    return this.getAllRoutes().find(
      (route) => route.playerId === playerId && route.routeType === routeType,
    );
  }

  /**
   * State-Lebenszyklus
   */
  public clearPlay(): void {
    this.players.clear();
    this.routes.clear();
    this.fieldPresetId = "STANDARD";
  }

  /**
   * Exportiert den reinen Datenzustand (Aufruf durch ExportService)
   */
  public exportDTO(): PlaySavePayload {
    return {
      fieldPresetId: this.fieldPresetId,
      players: this.getAllPlayers().map((p) => p.serialize()),
      routes: this.getAllRoutes().map((r) => r.serialize()),
    };
  }

  /**
   * Baut den State aus reinem JSON auf (Aufruf durch LoadPlayCommand)
   */
  public loadFromDTO(data: PlayImportData): void {
    this.clearPlay();
    this.fieldPresetId = data.fieldPresetId || "STANDARD";

    if (data.players) {
      data.players.forEach((p) => {
        this.addPlayer(new PlayerModel(p));
      });
    }

    if (data.routes) {
      data.routes.forEach((r) => {
        this.addRoute(new RouteModel(r));
      });
    }
  }
}
