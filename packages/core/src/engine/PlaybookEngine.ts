import { Line } from "fabric";
import {
  FIELD_PRESETS,
  FORMATION_PRESETS,
  ROUTE_PRESETS,
} from "../data/presets";
import { DEFAULT_LOS_Y } from "../data/presets/fields";
import { PlayerEntity, type PlayerConfig } from "../entities/PlayerEntity";
import { RouteEntity } from "../entities/RouteEntity";
import { AddPlayerCommand } from "../history/commands/AddPlayerCommand";
import { AddRouteCommand } from "../history/commands/AddRouteCommand";
import { LoadFormationCommand } from "../history/commands/LoadFormationCommand";
import {
  MovePlayerCommand,
  MoveRouteCommand,
} from "../history/commands/MoveCommands";
import { RemovePlayerCommand } from "../history/commands/RemovePlayerCommand";
import { RemoveRouteCommand } from "../history/commands/RemoveRouteCommand";
import { HistoryManager } from "../history/HistoryManager";
import { CANVAS_SIZE, CanvasManager } from "../managers/CanvasManager";
import { FieldManager } from "../managers/FieldManager";
import { NotificationManager } from "../managers/NotificationManager";
import { PlayManager } from "../managers/PlayManager";
import { RouteDrawingManager } from "../managers/RouteDrawingManager";
import { SelectionManager } from "../managers/SelectionManager";
import {
  SegmentType,
  type CoreNotification,
  type PlayExportData,
  type RouteNode,
  type ThumbnailOptions,
} from "../types/interfaces";
import type { RoutePreset } from "../types/presets";
import { FormationBuilder } from "../utils/FormationBuilder";

export class PlaybookEngine {
  private historyManager: HistoryManager;
  private playManager: PlayManager;
  private canvasManager: CanvasManager;
  private selectionManager: SelectionManager;
  private fieldManager: FieldManager;
  private routeDrawingManager: RouteDrawingManager;
  private notificationManager: NotificationManager;
  private currentFieldPresetId: string = "STANDARD";

  constructor() {
    this.historyManager = new HistoryManager();
    this.canvasManager = new CanvasManager();
    this.notificationManager = new NotificationManager();
    this.fieldManager = new FieldManager(this.canvasManager);

    this.playManager = new PlayManager(
      this.canvasManager,
      this.historyManager,
      this.fieldManager,
      this.notificationManager,
    );

    this.selectionManager = new SelectionManager(
      this.canvasManager,
      this.playManager,
    );

    this.routeDrawingManager = new RouteDrawingManager(
      this.canvasManager,
      this.selectionManager,
    );
  }

  /*------------------------*/
  /*  Funktionen für außen  */
  /*------------------------*/

  public init(canvasElement: HTMLCanvasElement): void {
    this.canvasManager.init(canvasElement);

    this.selectionManager.setupSelectionEvents();

    this.historyManager.subscribe(() => {
      this.canvasManager.requestRender();
    });

    this.routeDrawingManager.onDrawingComplete = (player, nodes, routeType) => {
      this.addRoute(player, nodes, routeType);
    };

    this.fieldManager.drawField(this.currentFieldPresetId);
    this.canvasManager.requestRender();
  }

  /**
   * Wartet auf Abschluss des Render Cycles und zerstört dann die Canvas
   */
  public dispose(): void {
    this.canvasManager.dispose();
  }

  /**
   * Skaliert die Canvas auf die Auflösung eines Parent Containers
   *  @param {number} [containerWidth] Breite des Parent Containers der Canvas
   */
  public handleResize(containerWidth: number): void {
    this.canvasManager.handleResize(containerWidth);
  }

  /**
   * Fügt einen neuen Spieler hinzu.
   * @param {PlayerConfig} [config] Konfiguration für einen neuen Spieler
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
        this.notificationManager,
      );

      this.historyManager.execute(command);
    };
  }

  /**
   * Fügt eine neue Route an den ausgewählten Spieler hinzu.
   * @param {RoutePreset} [preset] ein gespeichertes Route-Preset
   * @param {string} [routeType] setzt den Typ der Route (default, option_1, option_2), standart ist 'default'
   */
  public addRouteFromPreset(
    preset: RoutePreset,
    routeType: string = "default",
  ): void {
    const player = this.selectionManager.getSelectedObject();
    if (!player || !(player instanceof PlayerEntity)) {
      this.notificationManager.sendFeedback(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );
      return;
    }

    const startX = player.x;
    const startY = player.y;

    const FIELD_CENTER_X = CANVAS_SIZE.width / 2;
    const isPlayerOnLeftSide = startX < FIELD_CENTER_X;
    const flipX = isPlayerOnLeftSide ? -1 : 1;

    const absoluteNodes: RouteNode[] = [];

    absoluteNodes.push({ x: startX, y: startY, type: SegmentType.STRAIGHT });

    for (const wp of preset.waypoints) {
      const lastNode = absoluteNodes[absoluteNodes.length - 1]!;
      const newNode: RouteNode = {
        x: lastNode.x + wp.dx * flipX,
        y: lastNode.y + wp.dy,
        type: wp.type || SegmentType.STRAIGHT,
      };

      if (
        wp.type === SegmentType.CURVE &&
        wp.cpInDx !== undefined &&
        wp.cpInDy !== undefined
      ) {
        newNode.cpInX = lastNode.x + wp.cpInDx * flipX;
        newNode.cpInY = lastNode.y + wp.cpInDy;
      }

      absoluteNodes.push(newNode);
    }

    this.addRoute(player, absoluteNodes, routeType);
  }

  /**
   * Startet das freie Zeichnen einer Route für einen ausgewählten Spieler
   * @param {string} [routeType] setzt den Typ der Route (default, option_1, option_2), standart ist 'default'
   */
  public startDrawingRoute(routeType = "default"): void {
    const player = this.selectionManager.getSelectedObject();
    if (!player || !(player instanceof PlayerEntity)) {
      this.notificationManager.sendFeedback(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );
      return;
    }

    this.routeDrawingManager.startDrawing(player, routeType);
  }

  /**
   * Beendet das freie Zeichnen einer Route
   */
  public cancelDrawingRoute(): void {
    this.routeDrawingManager.cancelDrawing();
  }

  /**
   * Löscht die ausgewähtle Entität mit seinen Abhänigkeiten
   */
  public deleteSelectedObject(): void {
    const selected = this.selectionManager.getSelectedObject();

    if (!selected) {
      this.notificationManager.sendFeedback(
        "warning",
        "Es ist kein Spieler oder Route ausgewählt!",
      );
      return;
    }

    if (selected instanceof RouteEntity) {
      this.deleteRoute(selected.id);
    }
    if (selected instanceof PlayerEntity) {
      this.removePlayer(selected.id);
    }
  }

  /**
   * Fügt eine neue Route an den ausgewählten Spieler hinzu.
   * @param {string} [formationId] id einer gespeicherten Formation
   * @param {number} [customX] ? setzt einen eigenen X-orgin Wert für Formation
   * @param {number} [customY] ? setzt einen eigenen Y-orgin Wert für Formation
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
      this.playManager,
      this.canvasManager,
      this.historyManager,
      this.notificationManager,
    );

    this.historyManager.execute(command);
  }

  /**
   * Ändert das Untergrund Feld aus einer Liste von Presets
   * @param {string} [presetId] id eines Untergrund Feldes
   */
  public changeFieldPreset(presetId: string): void {
    this.currentFieldPresetId = presetId;
    if (!this.fieldManager)
      throw new Error("FieldManager ist nicht initialisiert!");

    this.fieldManager.drawField(presetId);
    this.canvasManager.requestRender();
  }

  /**
   * Ändert das Untergrund Feld aus einer Liste von Presets
   * @returns {string} Gibt einen `string` von einem Play Objekt zurück
   */
  public exportPlay(): string {
    return JSON.stringify(this.playManager.exportPlay());
  }

  /**
   * Lädt und initzaliert ein Play in der Engine
   * @param {string} [jsonString] `string` eines Play Objektes
   */
  public loadPlay(data: string): void {
    const playData = JSON.parse(data) as PlayExportData;

    this.playManager.getAllEntities().forEach((entity) => {
      this.canvasManager.removeEntity(entity);
      if (entity instanceof RouteEntity) {
        entity.destroyAllHandles();
      }
    });
    this.playManager.clearPlay();
    this.historyManager.clear();

    this.currentFieldPresetId = playData.fieldPresetId;
    this.fieldManager.drawField(this.currentFieldPresetId);

    playData.players.forEach((pData) => {
      const player = new PlayerEntity({
        id: pData.id,
        x: pData.x,
        y: pData.y,
        label: pData.label,
        color: pData.color,
        shape: pData.shape,
      });

      player.onMoveComplete = (playerId, startX, startY, endX, endY) => {
        const command = new MovePlayerCommand(
          playerId,
          startX,
          startY,
          endX,
          endY,
          this.playManager,
          this.canvasManager,
          this.notificationManager,
        );

        this.historyManager.execute(command);
      };

      this.playManager.addEntity(player);
      this.canvasManager.addEntity(player);
    });

    playData.routes.forEach((rData) => {
      const route = new RouteEntity({
        id: rData.id,
        playerId: rData.playerId,
        routeType: rData.routeType,
        color: rData.color,
        nodes: JSON.parse(JSON.stringify(rData.nodes)),
      });

      route.onNodesModified = (routeId, oldNodes, newNodes) => {
        const moveCommand = new MoveRouteCommand(
          routeId,
          oldNodes,
          newNodes,
          this.playManager,
          this.canvasManager,
          this.notificationManager,
        );
        this.historyManager.execute(moveCommand);
      };

      this.playManager.addEntity(route);
      this.canvasManager.addEntity(route);

      route.initializeControls(this.canvasManager.getRawCanvas());
    });

    this.playManager.getAllEntities().forEach((entity) => {
      if (entity instanceof PlayerEntity) {
        this.canvasManager.bringObjectToFront(entity);
      }
    });

    this.canvasManager.requestRender();

    this.notificationManager.sendFeedback(
      "success",
      "Spielzug erfolgreich geladen!",
    );
  }

  /**
   * Gibt ID's aller System Routen
   * @returns {string[]} Gibt ein `string []` von allen System Routen id's zurück
   */
  public getAllSystemRoutes(): string[] {
    return Object.keys(ROUTE_PRESETS);
  }

  /**
   * Gibt ID's aller System Formationen
   * @returns {string[]} Gibt ein `string []` von allen System Formationen id's zurück
   */
  public getAllSystemFormations(): string[] {
    return Object.keys(FORMATION_PRESETS);
  }

  /**
   * Gibt ID's aller System Feld Presets
   * @returns {string[]} Gibt ein `string []` von allen System Feld Presets id's zurück
   */
  public getAllSystemFields(): string[] {
    return Object.keys(FIELD_PRESETS);
  }

  /**
   * Generiert ein Bild der Canvas
   * @param {ThumbnailOptions} [options] Export-Optionen
   * @returns {string} Gibt ein `string` von einem Base64 IMG zurück
   */
  public generateThumbnail(options: ThumbnailOptions = {}): string {
    this.selectionManager.hideAllRouteControls();
    return this.canvasManager.generateThumbnail(options);
  }

  public exportFormationThumbnail(): string {
    const canvas = this.canvasManager.getRawCanvas();

    // 1. Alles ausblenden (Hintergrund und alle Objekte)
    this.fieldManager.clearField();

    canvas.getObjects().forEach((obj) => {
      obj.visible = false;
    });

    // 2. Nur Spieler herausfiltern und wieder sichtbar machen
    const players = this.playManager
      .getAllEntities()
      .filter((e) => e instanceof PlayerEntity) as PlayerEntity[];

    if (players.length === 0) {
      console.warn("Keine Spieler gefunden!");
      return "";
    }

    players.forEach((player) => {
      player.getFabricObjects().forEach((obj) => {
        obj.visible = true;
      });
    });

    const finalLosY = DEFAULT_LOS_Y;

    const fabricLine = new Line([-1000, finalLosY, 10000, finalLosY], {
      stroke: "#121212",
      strokeWidth: 4,
      selectable: false,
      evented: false,
      hoverCursor: "default",
    });

    this.canvasManager.addFabricObject(fabricLine);

    this.canvasManager.sendToBack(fabricLine);

    canvas.discardActiveObject();
    canvas.renderAll(); // Fabric.js zwingen, die Sichtbarkeiten sofort anzuwenden

    // 4. Zuschneiden: Volle Breite, Y-Achse 120px hoch und runter (insgesamt 240px)
    const cropTop = finalLosY - 120;
    const cropHeight = 240;
    const cropWidth = canvas.width || 800; // Volle Breite des Canvas

    // 5. Bild generieren
    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier: 0.7,
      left: 0,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    });

    return dataURL;
  }

  /**
   * Macht die letzte Aktion rückgänig
   */
  public undo(): void {
    this.historyManager.undo();
  }

  /**
   * Stellt die letzte Aktion wieder her
   */
  public redo(): void {
    this.historyManager.redo();
  }

  /**
   * Kann Rückgänig gemacht werden?
   * @returns {boolean} `boolean`
   */
  public canUndo(): boolean {
    return this.historyManager.canUndo();
  }

  /**
   * Kann Wiederhergestellt werden?
   * @returns {boolean} `boolean`
   */
  public canRedo(): boolean {
    return this.historyManager.canRedo();
  }

  /**
   * Aboniert über Änderungen im History Stack (undo/redo)
   * @param callback Die Funktion, die das Frontend ausführt (z.B. isRedo anzeigen)
   * @returns Eine Unsubscribe-Funktion (wichtig für z.B. React useEffect Cleanup)
   */
  public subscribeToHistoryChanges(callback: () => void): () => void {
    const unsubscribe = this.historyManager.subscribe(callback);
    return unsubscribe;
  }

  /**
   * Erlaubt dem Frontend, sich für Benachrichtigungen aus dem Core anzumelden.
   *
   * @param callback Die Funktion, die das Frontend ausführt (z.B. Toast anzeigen)
   * @returns Eine Unsubscribe-Funktion (wichtig für z.B. React useEffect Cleanup)
   */
  public onNotification(
    callback: (notification: CoreNotification) => void,
  ): () => void {
    const unsubscribe = this.notificationManager.subscribe(callback);
    return unsubscribe;
  }

  /**
   * Aboniert über Änderungen für den Drawing Mode
   *
   * @param callback Die Funktion, die das Frontend ausführt (z.B. Toast anzeigen)
   * @returns Eine Unsubscribe-Funktion (wichtig für z.B. React useEffect Cleanup)
   */
  public subscribeToDrawingMode(
    callback: (isDrawing: boolean) => void,
  ): () => void {
    return this.routeDrawingManager.onStateChange(callback);
  }

  /*-------------------*/
  /*  Hilfsfunktionen  */
  /*-------------------*/

  /**
   * Entfernt einen Spieler anhand seiner ID.
   */
  private removePlayer(playerId: string): void {
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
