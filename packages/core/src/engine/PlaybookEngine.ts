import { EntityManager } from "../managers/EntityManager";
import { HistoryManager } from "../history/HistoryManager";
import { CanvasManager } from "../managers/CanvasManager";
import { SelectionManager } from "../managers/SelectionManager";
import { FieldManager } from "../managers/FieldManager";
import { FormationManager } from "../managers/FormationManager";

import { PlayerEntity, type PlayerConfig } from "../entities/PlayerEntity";
import type { ICommand } from "../types/history";

// Commands
import { AddPlayerCommand } from "../history/commands/AddPlayerCommand";
import { RemovePlayerCommand } from "../history/commands/RemovePlayerCommand";
import { AssignRouteCommand } from "../history/commands/AssignRouteCommand";
import { LoadFormationCommand } from "../history/commands/LoadFormationCommand";
import { PlayManager } from "../managers/PlayManager";
import { RouteEntity } from "../entities/RouteEntity";

export class PlaybookEngine {
  // === Manager ===
  public readonly historyManager: HistoryManager;
  public readonly entityManager: EntityManager;
  private playManager: PlayManager;

  private canvasManager: CanvasManager;
  private selectionManager!: SelectionManager;
  private fieldManager!: FieldManager;
  public formationManager!: FormationManager;

  private currentFieldPresetId: string = "STANDARD";

  constructor() {
    this.historyManager = new HistoryManager();
    this.canvasManager = new CanvasManager();
    this.entityManager = new EntityManager(this.canvasManager);
    this.playManager = new PlayManager(
      this.entityManager,
      this.canvasManager,
      this.historyManager,
    );
  }

  public init(canvasElement: HTMLCanvasElement): void {
    this.canvasManager.init(canvasElement);

    this.fieldManager = new FieldManager(this.canvasManager);
    this.selectionManager = new SelectionManager(
      this.canvasManager,
      this.entityManager,
    );

    this.formationManager = new FormationManager(
      this.entityManager,
      this.canvasManager,
      this.currentFieldPresetId,
      this.handleEntityCommand,
    );

    this.historyManager.subscribe(() => {
      this.canvasManager.requestRender();
    });

    this.fieldManager.drawField(this.currentFieldPresetId);
    this.canvasManager.requestRender();
  }

  public dispose(): void {
    this.canvasManager.dispose();
  }

  public handleResize(containerWidth: number): void {
    this.canvasManager.handleResize(containerWidth);
  }

  /**
   * Wird an Entitäten (Player/Route) übergeben, damit deren Drag & Drop
   * oder Resize-Events saubere Commands in unserer History erzeugen.
   */
  private handleEntityCommand = (command: ICommand) => {
    this.historyManager.execute(command);
  };

  /**
   * Fügt einen neuen Spieler hinzu.
   */
  public addPlayer(config: PlayerConfig): string {
    const player = this.entityManager.createPlayer(
      config,
      this.handleEntityCommand,
    );

    const command = new AddPlayerCommand(
      player,
      this.canvasManager,
      this.entityManager,
    );
    this.historyManager.execute(command);

    return player.id;
  }

  /**
   * Entfernt einen Spieler anhand seiner ID.
   */
  public removePlayer(playerId: string): void {
    const player = this.entityManager.getPlayer(playerId);
    if (!player) return;

    const command = new RemovePlayerCommand(
      player,
      this.canvasManager,
      this.entityManager,
    );
    this.historyManager.execute(command);
  }

  /**
   * Entfernt den aktuell auf dem Canvas markierten Spieler.
   */
  public removeSelectedPlayer(): void {
    const selectedId = this.selectionManager.getSelectedPlayerId();
    if (!selectedId) {
      console.warn("Es ist kein Spieler ausgewählt!");
      return;
    }
    this.removePlayer(selectedId);
  }

  /**
   * Weist einem bestimmten Spieler eine Route zu.
   */
  public assignRouteToPlayer(playerId: string, routePresetId: string): void {
    const player = this.entityManager.getPlayer(playerId);
    if (!player) return;

    const newRoute = this.entityManager.createRoute(
      playerId,
      routePresetId,
      this.handleEntityCommand,
    );
    if (!newRoute) return;

    const oldRoute = player.route;

    const command = new AssignRouteCommand(
      player,
      newRoute,
      oldRoute,
      this.canvasManager,
    );

    this.historyManager.execute(command);
  }

  /**
   * Weist dem aktuell markierten Spieler eine Route zu.
   */
  public assignRouteToSelectedPlayer(routePresetId: string): void {
    const selectedId = this.selectionManager.getSelectedPlayerId();
    if (!selectedId) {
      console.warn("Es ist kein Spieler ausgewählt!");
      return;
    }
    this.assignRouteToPlayer(selectedId, routePresetId);
  }

  /**
   * Löscht die Route mithilfe der ID
   */
  public deleteRoute(routeID: string): void {
    const players = this.entityManager.getAllPlayers();
    for (const player of players) {
      if (player.route && player.route.id === routeID) {
        const command = new AssignRouteCommand(
          player,
          null as any,
          player.route,
          this.canvasManager,
        );
        this.historyManager.execute(command);
      }
    }
    console.warn("Keine Route gefunden");
  }

  public deleteSelectedRoute(): void {
    const selectedId = this.selectionManager.getSelectedRouteId();
    if (!selectedId) return;
    this.deleteRoute(selectedId);
  }

  public deleteSelectedObject(): void {
    const selected = this.selectionManager.getSelectedObject();

    if (!selected) return;

    if (selected instanceof RouteEntity) {
      this.deleteRoute(selected.id);
    }
    if (selected instanceof PlayerEntity) {
      this.removePlayer(selected.id);
    }
  }

  /**
   * Lädt eine komplette Formation auf das Feld.
   */
  public loadFormation(
    formationId: string,
    customX?: number,
    customY?: number,
  ): void {
    const command = new LoadFormationCommand(
      this.formationManager,
      formationId,
      customX,
      customY,
    );
    this.historyManager.execute(command);
  }

  /**
   * Ändert das Spielfeld-Design (z.B. Highschool, NFL, etc.).
   */
  public changeFieldPreset(presetId: string): void {
    this.currentFieldPresetId = presetId;
    if (this.fieldManager) {
      this.fieldManager.drawField(presetId);
      this.canvasManager.requestRender();
    }
  }

  /**
   * Gibt ID des aktuell ausgewählten Spielers zurück (oder null, falls keiner ausgewählt ist).
   */
  public getSelectedPlayerId(): string | null {
    if (!this.selectionManager) return null;
    return this.selectionManager.getSelectedPlayerId();
  }

  /**
   * Generiert einen JSON-String des aktuellen Spielfelds.
   */
  public savePlay(playName: string): string {
    const playId = `play_${Date.now()}`;

    const savedPlay = this.playManager.savePlay(playId, playName);

    return JSON.stringify(savedPlay);
  }

  /**
   * Lädt ein Spielfeld anhand eines JSON-Strings.
   */
  public loadPlay(jsonString: string): boolean {
    try {
      const savedPlay = JSON.parse(jsonString);

      const onCommand = (cmd: ICommand) => {
        this.historyManager.execute(cmd);
      };

      this.playManager.loadPlay(savedPlay, onCommand);
      this.fieldManager.drawField(this.currentFieldPresetId);

      return true;
    } catch (error) {
      console.error("Fehler beim Laden des Plays:", error);
      return false;
    }
  }

  public getAllSystemFormations(): string[] {
    return this.formationManager.getAllSystemFormations();
  }

  /**
   * Macht die letzte Aktion rückgängig.
   */
  public undo(): void {
    this.historyManager.undo();
  }

  /**
   * Stellt die letzte rückgängig gemachte Aktion wieder her.
   */
  public redo(): void {
    this.historyManager.redo();
  }
}
