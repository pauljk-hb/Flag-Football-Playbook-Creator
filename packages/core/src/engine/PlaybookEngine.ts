import { LoadFormationCommand } from "@/commands/formation/LoadFormationCommand";
import { AddPlayerCommand } from "@/commands/player/AddPlayerCommand";
import { RemovePlayerCommand } from "@/commands/player/RemovePlayerCommand";
import { AddRouteCommand } from "@/commands/route/AddRouteCommand";
import { RemoveRouteCommand } from "@/commands/route/RemoveRouteCommand";
import { PlayModel } from "@/playModel/PlayModel";
import { RenderService } from "@/rendering/RenderService";
import { EventBus } from "@/services/events/EventBus";
import type { PublicPlaybookEventMap } from "@/services/events/types/EventTypes";
import { HistoryService } from "@/services/history/HistoryService";
import type { PDFExportOptions } from "@/types/export";
import { Line } from "fabric";
import {
  FIELD_PRESETS,
  FORMATION_PRESETS,
  ROUTE_PRESETS,
} from "../data/presets";
import { DEFAULT_LOS_Y } from "../data/presets/fields";
import { RouteDrawingService } from "../services/drawing/DrawingService";
import { SelectionService } from "../services/selection/SelectionService";
import {
  SegmentType,
  type PlaybookMode,
  type PlayerImportData,
  type PlayerStyle,
  type PlayImportData,
  type RouteNode,
  type SelectionItem,
  type ThumbnailOptions,
} from "../types/interfaces";
import type { RoutePreset } from "../types/presets";
import { FormationBuilder } from "../utils/FormationBuilder";
import { setupEngineListeners } from "./setupEngineListeners";

export class PlaybookEngine {
  private eventBus!: EventBus;
  private playModel!: PlayModel;

  private historyService!: HistoryService;
  private renderService!: RenderService;
  private selectionService!: SelectionService;
  private routeDrawingService!: RouteDrawingService;

  private currentFieldPresetId: string = "STANDARD";
  public currentSelection: SelectionItem[] = [];

  /*------------------------*/
  /*  Funktionen für außen  */
  /*------------------------*/

  public init(canvasElement: HTMLCanvasElement): void {
    this.eventBus = new EventBus();
    this.playModel = new PlayModel();

    this.playModel.fieldPresetId = this.currentFieldPresetId;

    this.historyService = new HistoryService(this.eventBus);
    this.renderService = new RenderService(
      canvasElement,
      this.eventBus,
      this.playModel,
    );

    // Die Sensoren bekommen nur die rohe Canvas
    const rawCanvas = this.renderService.getRawCanvas();
    this.selectionService = new SelectionService(rawCanvas, this.eventBus);
    this.routeDrawingService = new RouteDrawingService(
      rawCanvas,
      this.eventBus,
    );

    setupEngineListeners(
      this,
      this.eventBus,
      this.playModel,
      this.historyService,
    );

    this.setMode("EDITOR");

    this.eventBus.emit("play:updated", undefined);
  }

  /**
   * Wartet auf Abschluss des Render Cycles und zerstört dann die Canvas
   */
  public dispose(): void {
    this.canvasManager.dispose();
  }

  /**
   * Wechselt den Modus zwischen Viewer und Editor.
   * @param {PlaybookMode} [newMode] "editor" | "viewer"
   */
  public setMode(mode: PlaybookMode): void {
    this.eventBus.emit("system:mode_changed", { mode });

    switch (mode) {
      case "EDITOR":
        this.routeDrawingService.stopDrawing();
        this.selectionService.enable();
        break;
      case "DRAW":
        this.selectionService.disable();
        break;
      case "READ_ONLY":
        this.routeDrawingService.stopDrawing();
        this.selectionService.disable();
        break;
    }
  }

  public getMode(): PlaybookMode {
    return this.mode;
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
  public addPlayer(config: PlayerImportData): void {
    const command = new AddPlayerCommand(this.playModel, config);

    this.historyService.execute(command);
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
    const playerId = this.selectedPlayerIds[0];
    const player = this.playModel.getPlayer(playerId);

    if (!playerId || !player) {
      this.eventBus.emit("system:notification", {
        level: "warning",
        message: "Es ist kein Spieler ausgewählt!",
      });
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

    const command = new AddRouteCommand(
      this.playModel,
      playerId,
      routeType,
      absoluteNodes,
    );
    this.historyService.execute(command);
  }

  /**
   * Startet das freie Zeichnen einer Route für einen ausgewählten Spieler
   * @param {string} [routeType] setzt den Typ der Route (default, option_1, option_2), standart ist 'default'
   */
  public startDrawingRoute(routeType = "default"): void {
    const playerId = this.selectedPlayerIds[0];
    const player = this.playModel.getPlayer(playerId);

    if (!playerId || !player) {
      this.eventBus.emit("system:notification", {
        level: "warning",
        message: "Es ist kein Spieler ausgewählt!",
      });
      return;
    }

    this.routeDrawingService.startDrawing(
      player.id,
      player.x,
      player.y,
      player.color,
      routeType,
    );

    this.setMode("DRAW");
  }

  /**
   * Beendet das freie Zeichnen einer Route
   */
  public stopDrawingRoute(): void {
    this.routeDrawingService.cancelDrawing();
  }

  /**
   * Löscht die ausgewähtle Entität mit seinen Abhänigkeiten
   */
  public deleteSelectedObject(): void {
    if (this.currentSelection.length === 0) {
      this.eventBus.emit("system:notification", {
        level: "warning",
        message: "Es ist nichts ausgewählt!",
      });
      return;
    }

    this.currentSelection.forEach((item) => {
      if (item.type === "PLAYER") {
        const command = new RemovePlayerCommand(this.playModel, item.id);
        this.historyService.execute(command);
      } else if (item.type === "ROUTE") {
        const command = new RemoveRouteCommand(this.playModel, item.id);
        this.historyService.execute(command);
      }
    });

    this.eventBus.emit("selection:cleared", undefined);
  }

  /**
   * Fügt eine neue Route an den ausgewählten Spieler hinzu.
   * @param {string} [formationId] id einer gespeicherten Formation
   * @param {Record<string, PlayerStyle>} [playerStyles] style der einzelnen spieler (kommt aus DB)
   * @param {number} [customX] ? setzt einen eigenen X-orgin Wert für Formation
   * @param {number} [customY] ? setzt einen eigenen Y-orgin Wert für Formation
   */
  public loadFormation(
    formationId: string,
    playerStyles: Record<string, PlayerStyle>,
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

    const spawnData = FormationBuilder.build(
      formationId,
      playerStyles,
      originX,
      originY,
    );

    if (!spawnData || spawnData.length === 0) {
      this.eventBus.emit("system:notification", {
        level: "warning",
        message: `Formation '${formationId}' konnte nicht geladen werden.`,
      });
      return;
    }

    const command = new LoadFormationCommand(this.playModel, spawnData);
    this.historyService.execute(command);
    this.eventBus.emit("selection:cleared", undefined);
  }

  /**
   * Ändert das Untergrund Feld aus einer Liste von Presets
   * @param {string} [presetId] id eines Untergrund Feldes
   */
  public changeFieldPreset(presetId: string): void {
    this.currentFieldPresetId = presetId;
    this.playModel.fieldPresetId = presetId;
    this.eventBus.emit("play:updated", undefined);
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
    try {
      const playData = JSON.parse(data) as PlayImportData;
      this.historyService.clear();
      this.playModel.loadFromDTO(playData);

      this.eventBus.emit("system:notification", {
        level: "success",
        message: "Spielzug erfolgreich geladen!",
      });

      this.eventBus.emit("play:updated", undefined);
      this.eventBus.emit("selection:cleared", undefined);
    } catch (error) {
      console.error("Fehler beim Laden des Spielzugs:", error);
      this.eventBus.emit("system:notification", {
        level: "error",
        message: "Fehler beim Laden des Spielzugs. Datei beschädigt?",
      });
    }
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

  /**
   * Generiert ein PDF-Playbook im Hintergrund und gibt es als Download-Blob zurück.
   * @param {PlayExportData & { title?: string }} [plays] Play Daten
   * @param {PDFExportOptions} [options] Export-Optionen
   */
  public async exportToPDF(
    plays: (PlayImportData & { title?: string })[],
    options: PDFExportOptions,
  ): Promise<Blob | null> {
    if (!plays || plays.length === 0) {
      this.notificationManager.sendFeedback(
        "error",
        "No plays provided for export.",
      );
      return null;
    }

    this.notificationManager.sendFeedback("info", "Generating PDF...");

    try {
      const pdfBlob = await this.exportManager.generatePDF(plays, options);
      this.notificationManager.sendFeedback(
        "success",
        "PDF generated successfully!",
      );
      return pdfBlob;
    } catch (error) {
      console.error("PDF Export failed:", error);
      this.notificationManager.sendFeedback("error", "Failed to generate PDF.");
      return null;
    }
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
    this.historyService.undo();
  }

  /**
   * Stellt die letzte Aktion wieder her
   */
  public redo(): void {
    this.historyService.redo();
  }

  /**
   * Kann Rückgänig gemacht werden?
   * @returns {boolean} `boolean`
   */
  public canUndo(): boolean {
    return this.historyService.canUndo();
  }

  /**
   * Kann Wiederhergestellt werden?
   * @returns {boolean} `boolean`
   */
  public canRedo(): boolean {
    return this.historyService.canRedo();
  }

  /**
   * Stellt das Event-Abonnement für die Außenwelt (React) bereit.
   * Strikt limitiert auf PublicPlaybookEventMap!
   */
  public on<T extends keyof PublicPlaybookEventMap>(
    event: T,
    callback: (payload: PublicPlaybookEventMap[T]) => void,
  ): () => void {
    this.eventBus.on(event as any, callback as any);

    return () => {
      this.eventBus.off(event as any, callback as any);
    };
  }

  /*-------------------*/
  /*  Hilfsfunktionen  */
  /*-------------------*/

  /**
   * Entfernt einen Spieler anhand seiner ID.
   */
  private removePlayer(playerId: string): void {
    const command = new RemovePlayerCommand(this.playModel, playerId);
    this.historyService.execute(command);

    this.eventBus.emit("selection:cleared", undefined);
  }

  /**
   * Löscht die Route mithilfe der ID
   */
  private deleteRoute(routeId: string): void {
    const command = new RemoveRouteCommand(this.playModel, routeId);
    this.historyService.execute(command);

    this.eventBus.emit("selection:cleared", undefined);
  }
}
