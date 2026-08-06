import { HistoryManager } from "../history/HistoryManager";
import { CanvasManager } from "../managers/CanvasManager";
import { SelectionManager } from "../managers/SelectionManager";
import { FieldManager } from "../managers/FieldManager";
import { FormationManager } from "../managers/FormationManager";
import { PlayerEntity, type PlayerConfig } from "../entities/PlayerEntity";
import type { ICommand } from "../types/history";
import { AddPlayerCommand } from "../history/commands/AddPlayerCommand";
import { RemovePlayerCommand } from "../history/commands/RemovePlayerCommand";
import { LoadFormationCommand } from "../history/commands/LoadFormationCommand";
import { PlayManager } from "../managers/PlayManager";
import { RouteEntity } from "../entities/RouteEntity";
import {
  SegmentType,
  type RouteNode,
  type SavedPlay,
  type ThumbnailOptions,
} from "../types/interfaces";
import {
  FIELD_PRESETS,
  FORMATION_PRESETS,
  ROUTE_PRESETS,
} from "../data/presets";
import {
  MovePlayerCommand,
  MoveRouteCommand,
} from "../history/commands/MoveCommands";
import { AddRouteCommand } from "../history/commands/AddRouteCommand";
import type { RoutePreset } from "../types/presets";
import { RemoveRouteCommand } from "../history/commands/RemoveRouteCommand";
import { FormationBuilder } from "../utils/FormationBuilder";

export class PlaybookEngine {
  private historyManager: HistoryManager;
  private playManager: PlayManager;
  private canvasManager: CanvasManager;
  private selectionManager!: SelectionManager;
  private fieldManager: FieldManager;
  public formationManager!: FormationManager;

  private currentFieldPresetId: string = "STANDARD";

  constructor() {
    this.historyManager = new HistoryManager();
    this.canvasManager = new CanvasManager();
    this.fieldManager = new FieldManager(this.canvasManager);

    this.playManager = new PlayManager(
      this.canvasManager,
      this.historyManager,
      this.fieldManager,
    );
  }

  /*------------------------*/
  /*  Funktionen für außen  */
  /*------------------------*/

  public init(canvasElement: HTMLCanvasElement): void {
    this.canvasManager.init(canvasElement);

    this.selectionManager = new SelectionManager(
      this.canvasManager,
      this.playManager,
    );

    this.selectionManager.setupSelectionEvents();

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
   * Fügt einen neuen Spieler hinzu.
   */
  public addPlayer(config: PlayerConfig): void {
    const playerEntity = new PlayerEntity(config);
    const command = new AddPlayerCommand(
      playerEntity,
      this.canvasManager,
      this.playManager,
    );
    this.historyManager.execute(command);

    playerEntity.onMoveComplete = (playerId, startX, startY, endX, endY) => {
      const command = new MovePlayerCommand(
        playerId,
        startX,
        startY,
        endX,
        endY,
        this.playManager,
        this.canvasManager,
      );

      this.historyManager.execute(command);
    };
  }

  public addRouteFromPreset(
    preset: RoutePreset,
    routeType: string = "default",
  ): void {
    const player = this.selectionManager.getSelectedObject();
    if (!player || !(player instanceof PlayerEntity)) {
      console.warn("Es ist kein Spieler ausgewählt!");
      return;
    }

    const startX = player.x;
    const startY = player.y;

    const absoluteNodes: RouteNode[] = [];

    absoluteNodes.push({ x: startX, y: startY, type: SegmentType.STRAIGHT });

    for (const wp of preset.waypoints) {
      const lastNode = absoluteNodes[absoluteNodes.length - 1]!;
      absoluteNodes.push({
        x: lastNode.x + wp.dx,
        y: lastNode.y + wp.dy,
        type: SegmentType.STRAIGHT,
      });
    }

    this.addRoute(player, absoluteNodes, routeType);
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
    let originX = customX;
    let originY = customY;

    if (originX === undefined || originY === undefined) {
      const fieldConfig =
        FIELD_PRESETS[this.currentFieldPresetId] || FIELD_PRESETS["STANDARD"];
      originX = fieldConfig ? fieldConfig.anchor.x : 400;
      originY = fieldConfig ? fieldConfig.anchor.y : 600;
    }

    const spawnData = FormationBuilder.build(formationId, originX, originY);

    if (spawnData.length === 0) return;

    const command = new LoadFormationCommand(
      spawnData,
      this.playManager, // bzw. EntityManager
      this.canvasManager,
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
   * Generiert einen JSON-String des aktuellen Spielfelds.
   */
  public getPlayData(): string {
    const savedPlay = this.playManager.savePlayData();

    return JSON.stringify(savedPlay);
  }

  /**
   * Lädt ein Spielfeld anhand eines JSON-Strings.
   */
  public loadPlay(jsonString: string): boolean {
    try {
      const savedPlay: SavedPlay = JSON.parse(jsonString);

      console.log("Core Json Load", savedPlay);

      const onCommand = (cmd: ICommand) => {
        this.historyManager.execute(cmd);
      };

      this.playManager.loadPlayData(savedPlay, onCommand);
      this.fieldManager.drawField(savedPlay.fieldPresetId);

      return true;
    } catch (error) {
      console.error("Fehler beim Laden des Plays:", error);
      return false;
    }
  }

  public getAllSystemRoutes(): string[] {
    return Object.keys(ROUTE_PRESETS);
  }

  public getAllSystemFormations(): string[] {
    return Object.keys(FORMATION_PRESETS);
  }

  public getAllSystemFields(): string[] {
    return Object.keys(FIELD_PRESETS);
  }

  public generateThumbnail(options: ThumbnailOptions = {}): string {
    return this.canvasManager.generateThumbnail();
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

  public canUndo(): boolean {
    return this.historyManager.canUndo();
  }

  public canRedo(): boolean {
    return this.historyManager.canRedo();
  }

  public subscribeToHistoryChanges(callback: () => void): () => void {
    const unsubscribe = this.historyManager.subscribe(callback);
    return unsubscribe;
  }

  /*-------------------*/
  /*  Hilfsfunktionen  */
  /*-------------------*/

  /**
   * Entfernt einen Spieler anhand seiner ID.
   */
  private removePlayer(playerId: string): void {
    this.playManager.getAllRoutesFromPlayer(playerId).forEach((route) => {
      const removeRouteCommand = new RemoveRouteCommand(
        route.id,
        this.playManager,
        this.canvasManager,
      );
      this.historyManager.execute(removeRouteCommand);
    });

    const command = new RemovePlayerCommand(
      playerId,
      this.playManager,
      this.canvasManager,
    );
    this.historyManager.execute(command);
  }

  /**
   * Weist einem bestimmten Spieler eine Route zu.
   */
  private addRoute(
    player: PlayerEntity,
    nodes: RouteNode[],
    routeType: string = "default",
  ): void {
    const existingRoute = this.playManager.getRouteByPlayerAndType(
      player.id,
      routeType,
    );

    const routeEntity = new RouteEntity({
      playerId: player.id,
      nodes: JSON.parse(JSON.stringify(nodes)),
      routeType: routeType,
      color: player.color,
    });

    const command = new AddRouteCommand(
      routeEntity,
      this.playManager,
      this.canvasManager,
      existingRoute || null,
    );

    this.historyManager.execute(command);

    routeEntity.onNodesModified = (routeId, oldNodes, newNodes) => {
      const moveCommand = new MoveRouteCommand(
        routeId,
        oldNodes,
        newNodes,
        this.playManager,
        this.canvasManager,
      );
      this.historyManager.execute(moveCommand);
    };

    this.canvasManager.bringObjectToFront(player);
  }

  /**
   * Löscht die Route mithilfe der ID
   */
  private deleteRoute(routeID: string): void {
    const command = new RemoveRouteCommand(
      routeID,
      this.playManager,
      this.canvasManager,
    );
    this.historyManager.execute(command);
  }
}
