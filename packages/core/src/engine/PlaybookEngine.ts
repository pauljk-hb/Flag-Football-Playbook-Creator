import { LoadFormationCommand } from "../commands/formation/LoadFormationCommand";
import { AddPlayerCommand } from "../commands/player/AddPlayerCommand";
import { RemovePlayerCommand } from "../commands/player/RemovePlayerCommand";
import { AddRouteCommand } from "../commands/route/AddRouteCommand";
import { RemoveRouteCommand } from "../commands/route/RemoveRouteCommand";
import { CANVAS, SYSTEM } from "../constants/constants";
import {
  FIELD_PRESETS,
  FORMATION_PRESETS,
  ROUTE_PRESETS,
} from "../data/presets";
import { PlayModel } from "../playModel/PlayModel";
import { RenderService } from "../rendering/RenderService";
import { RouteDrawingService } from "../services/drawing/DrawingService";
import { EventBus } from "../services/events/EventBus";
import type { PublicPlaybookEventMap } from "../services/events/types/EventTypes";
import { ExportService } from "../services/export/ExportService";
import { HistoryService } from "../services/history/HistoryService";
import { SelectionService } from "../services/selection/SelectionService";
import {
  SegmentType,
  type PlayDTO,
  type PlayerDTO,
  type PlayerStyle,
  type RouteNode,
} from "../types/domain";
import type { PDFExportOptions, ThumbnailOptions } from "../types/export";
import type { RoutePreset } from "../types/presets";
import type {
  PlaybookConfig,
  PlaybookMode,
  SelectionItem,
} from "../types/system";
import { FormationBuilder } from "../utils/FormationBuilder";
import { setupEngineListeners } from "./setupEngineListeners";

export class PlaybookEngine {
  private eventBus!: EventBus;
  private playModel!: PlayModel;
  private playbookConfig!: PlaybookConfig;

  private historyService!: HistoryService;
  private renderService!: RenderService;
  private exportService!: ExportService;
  private selectionService!: SelectionService;
  private routeDrawingService!: RouteDrawingService;

  public currentSelection: SelectionItem[] = [];

  /*------------------------*/
  /*  Funktionen für außen  */
  /*------------------------*/

  public init(
    canvasElement: HTMLCanvasElement,
    playbookConfig: PlaybookConfig,
  ): void {
    this.eventBus = new EventBus();
    this.playModel = new PlayModel();
    this.playbookConfig = playbookConfig;

    this.playModel.setFieldPreset("STANDARD");

    this.historyService = new HistoryService(this.eventBus);
    this.exportService = new ExportService(
      this.renderService,
      this.playModel,
      this.playbookConfig.themeConfig,
    );
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

    this.setMode(this.playbookConfig.playbookMode);

    this.eventBus.emit("play:updated", undefined);
  }

  /**
   * Wartet auf Abschluss des Render Cycles und zerstört dann die Canvas
   */
  public dispose(): void {
    this.renderService.dispose();
  }

  /**
   * Wechselt den Modus zwischen Viewer und Editor.
   * @param {PlaybookMode} [newMode] "editor" | "viewer"
   */
  public setMode(mode: PlaybookMode): void {
    this.eventBus.emit("system:mode_changed", mode);

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

  /**
   * Skaliert die Canvas auf die Auflösung eines Parent Containers
   *  @param {number} [containerWidth] Breite des Parent Containers der Canvas
   */
  public handleResize(containerWidth: number): void {
    this.renderService.resize(containerWidth);
  }

  /**
   * Fügt einen neuen Spieler hinzu.
   * @param {PlayerConfig} [config] Konfiguration für einen neuen Spieler
   */
  public addPlayer(config: PlayerDTO): void {
    const command = new AddPlayerCommand(
      this.playModel,
      config,
      this.playbookConfig.themeConfig,
    );

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
    const selectedPlayers = this.currentSelection.filter(
      (item) => item.type === "PLAYER",
    );

    if (selectedPlayers.length === 0) {
      this.eventBus.emit("system:notification", {
        level: "warning",
        message: "Es ist kein Spieler ausgewählt!",
      });
      return;
    }

    const playerId = selectedPlayers[0].id;
    const player = this.playModel.getPlayer(playerId);

    if (!player) return;

    const startPosition = player.position;

    const FIELD_CENTER_X = CANVAS.WIDTH / 2;
    const isPlayerOnLeftSide = startPosition.x < FIELD_CENTER_X;
    const flipX = isPlayerOnLeftSide ? -1 : 1;

    const absoluteNodes: RouteNode[] = [];

    absoluteNodes.push({ position: startPosition, type: SegmentType.STRAIGHT });

    for (const wp of preset.waypoints) {
      const lastNode = absoluteNodes[absoluteNodes.length - 1]!;
      const newNode: RouteNode = {
        position: {
          x: lastNode.position.x + wp.dx * flipX,
          y: lastNode.position.y + wp.dy,
        },
        type: wp.type || SegmentType.STRAIGHT,
      };

      if (
        wp.type === SegmentType.CURVE &&
        wp.cpInDx !== undefined &&
        wp.cpInDy !== undefined
      ) {
        newNode.cpIn = {
          x: lastNode.position.x + wp.cpInDx * flipX,
          y: lastNode.position.y + wp.cpInDy,
        };
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
    const selectedPlayers = this.currentSelection.filter(
      (item) => item.type === "PLAYER",
    );

    if (selectedPlayers.length === 0) {
      this.eventBus.emit("system:notification", {
        level: "warning",
        message: "Es ist kein Spieler ausgewählt!",
      });
      return;
    }

    const playerId = selectedPlayers[0].id;
    const player = this.playModel.getPlayer(playerId);

    if (!player) return;

    this.routeDrawingService.startDrawing(
      player.id,
      player.position,
      player.style.color,
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
        FIELD_PRESETS[this.playModel.getField().getPresetId()] ||
        FIELD_PRESETS["STANDARD"];
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

    const command = new LoadFormationCommand(
      this.playModel,
      spawnData,
      this.playbookConfig.themeConfig,
    );
    this.historyService.execute(command);
    this.eventBus.emit("selection:cleared", undefined);
  }

  /**
   * Ändert das Untergrund Feld aus einer Liste von Presets
   * @param {string} [presetId] id eines Untergrund Feldes
   */
  public changeFieldPreset(presetId: string): void {
    this.playModel.setFieldPreset(presetId);
    this.eventBus.emit("play:updated", undefined);
  }

  /**
   * Ändert das Untergrund Feld aus einer Liste von Presets
   * @returns {string} Gibt einen `string` von einem Play Objekt zurück
   */
  public exportPlay(): string {
    return JSON.stringify(this.playModel.exportDTO());
  }

  /**
   * Lädt und initzaliert ein Play in der Engine
   * @param {string} [jsonString] `string` eines Play Objektes
   */
  public loadPlay(data: string): void {
    try {
      const playData = JSON.parse(data) as PlayDTO;

      if (playData.version !== SYSTEM.DATA_VERSION) {
        this.eventBus.emit("system:notification", {
          level: "error",
          message: "Inkompatible Version des Spielzugs!",
        });
        return;
      }

      this.historyService.clear();
      this.playModel.loadFromDTO(playData, this.playbookConfig.themeConfig);

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
    this.eventBus.emit("selection:cleared", undefined);
    return this.exportService.exportPlayAsImage(options);
  }

  /**
   * Generiert ein PDF-Playbook im Hintergrund und gibt es als Download-Blob zurück.
   * @param {PlayDTO & { title?: string }} [plays] Play Daten
   * @param {PDFExportOptions} [options] Export-Optionen
   */
  public async exportToPDF(
    plays: (PlayDTO & { title?: string })[],
    options: PDFExportOptions,
  ): Promise<Blob | null> {
    if (!plays || plays.length === 0) {
      this.eventBus.emit("system:notification", {
        level: "error",
        message: "No plays provided for export.",
      });
      return null;
    }

    this.eventBus.emit("system:notification", {
      level: "info",
      message: "Generating PDF...",
    });

    try {
      const pdfBlob = await this.exportService.exportPlaybookAsPDF(
        plays,
        options,
      );

      this.eventBus.emit("system:notification", {
        level: "success",
        message: "PDF generated successfully!",
      });

      return pdfBlob;
    } catch (error) {
      console.error("PDF Export failed:", error);
      this.eventBus.emit("system:notification", {
        level: "error",
        message: "Failed to generate PDF.",
      });
      return null;
    }
  }

  // public exportFormationThumbnail(): string {
  //   try {
  //     const currentPlayData = this.playModel.exportToDTO();

  //     return await this.exportService.exportFormationThumbnail(currentPlayData, options);

  //   } catch (error) {
  //     console.error("Fehler beim Generieren des Formation-Thumbnails:", error);
  //     this.eventBus.emit("system:notification", {
  //       level: "error",
  //       message: "Formation Thumbnail konnte nicht erstellt werden."
  //     });
  //     return "";
  //   }
  // }

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
}
