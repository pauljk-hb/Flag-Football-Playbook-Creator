import { PlaybookEngine } from "./engine/PlaybookEngine";
import type { PublicPlaybookEventMap } from "./services/events/types/EventTypes";
import type { PlayDTO, PlayerDTO, PlayerStyle } from "./types";
import type { PDFExportOptions, ThumbnailOptions } from "./types/export";
import type { RoutePreset } from "./types/presets";
import type { PlaybookConfig, PlaybookMode } from "./types/system";

/**
 * Die PlaybookAPI ist die Fassade für das Frontend.
 * Liefert alle Funktionalität für die Playbook/Core
 * Sie exponiert keine internen Manager oder Entitäten, sondern nur DTOs und primitive Datentypen.
 */
export class PlaybookAPI {
  private engine: PlaybookEngine;

  constructor() {
    this.engine = new PlaybookEngine();
  }

  /** Bindet die Canvas an die Engine
   * @param {HTMLCanvasElement} [canvas] html Canvas in der die Playbook Engine initzialisiert wird.
   * @param {PlaybookConfig} [playbookConfig] Konfiguration für das Playbook
   */
  public init(canvas: HTMLCanvasElement, playbookConfig: PlaybookConfig): void {
    this.engine.init(canvas, playbookConfig);
  }

  //Canvas Elemente
  /**
   * Wartet auf Abschluss des Render Cycles und zerstört dann die Canvas
   */
  public dispose(): void {
    this.engine.dispose();
  }

  /**
   * Skaliert die Canvas auf die Auflösung eines Parent Containers
   *  @param {number} [containerWidth] Breite des Parent Containers der Canvas
   */
  public handleResize(containerWidth: number): void {
    this.engine.handleResize(containerWidth);
  }

  /**
   * Wechselt den Modus zwischen Viewer und Editor.
   * @param {PlaybookMode} [newMode] "editor" | "viewer"
   */
  public setMode(newMode: PlaybookMode): void {
    this.engine.setMode(newMode);
  }

  //Entity's on Canvas
  /**
   * Fügt einen neuen Spieler hinzu.
   * @param {PlayerConfig} [config] Konfiguration für einen neuen Spieler
   */
  public addPlayer(config: Omit<PlayerDTO, "id">): void {
    this.engine.addPlayer(config);
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
    this.engine.addRouteFromPreset(preset, routeType);
  }

  /**
   * Startet das freie Zeichnen einer Route für einen ausgewählten Spieler
   * @param {string} [routeType] setzt den Typ der Route (default, option_1, option_2), standart ist 'default'
   */
  public startDrawingRoute(routeType = "default"): void {
    this.engine.startDrawingRoute(routeType);
  }

  /**
   * Beendet das freie Zeichnen einer Route
   */
  public stopDrawingRoute(): void {
    this.engine.stopDrawingRoute();
  }

  /**
   * Löscht die ausgewähtle Entität mit seinen Abhänigkeiten
   */
  public deleteSelectedObject(): void {
    this.engine.deleteSelectedObject();
  }

  /**
   * Fügt eine neue Route an den ausgewählten Spieler hinzu.
   * @param {string} [formationId] id einer gespeicherten Formation
   * @param {number} [customX] ? setzt einen eigenen X-orgin Wert für Formation
   * @param {number} [customY] ? setzt einen eigenen Y-orgin Wert für Formation
   */
  public loadFormation(
    formationId: string,
    playerStyles: Record<string, PlayerStyle>,
    customX?: number,
    customY?: number,
  ): void {
    this.engine.loadFormation(formationId, playerStyles, customX, customY);
  }

  /**
   * Ändert das Untergrund Feld aus einer Liste von Presets
   * @param {string} [presetId] id eines Untergrund Feldes
   */
  public changeFieldPreset(presetId: string): void {
    this.engine.changeFieldPreset(presetId);
  }

  /**
   * Ändert das Untergrund Feld aus einer Liste von Presets
   * @returns {string} Gibt einen `string` von einem Play Objekt zurück
   */
  public exportPlay(): string {
    return this.engine.exportPlay();
  }

  /**
   * Generiert ein Bild der Canvas
   * @param {ThumbnailOptions} [options] Export-Optionen
   * @returns {string} Gibt ein `string` von einem Base64 IMG zurück
   */
  public generateThumbnail(options: ThumbnailOptions = {}): string {
    return this.engine.generateThumbnail(options);
  }

  /**
   * Generiert ein PDF-Playbook im Hintergrund und gibt es als Download-Blob zurück.
   * @param {PlayExportData & { title?: string }} [plays] Play Daten
   * @param {PDFExportOptions} [options] Export-Optionen
   */
  public async exportToPDF(
    plays: (PlayDTO & { title?: string })[],
    options: PDFExportOptions,
  ): Promise<Blob | null> {
    return this.engine.exportToPDF(plays, options);
  }

  /**
   * Lädt und initzaliert ein Play in der Engine
   * @param {string} [jsonString] `string` eines Play Objektes
   */
  public loadPlay(jsonString: string): void {
    this.engine.loadPlay(jsonString);
  }

  //System Presets

  /**
   * Gibt ID's aller System Formationen
   * @returns {string[]} Gibt ein `string []` von allen System Formationen id's zurück
   */
  public getAllSystemFormations(): string[] {
    return this.engine.getAllSystemFormations();
  }

  /**
   * Gibt ID's aller System Routen
   * @returns {string[]} Gibt ein `string []` von allen System Routen id's zurück
   */
  public getAllSystemRoutes(): string[] {
    return this.engine.getAllSystemRoutes();
  }

  /**
   * Gibt ID's aller System Feld Presets
   * @returns {string[]} Gibt ein `string []` von allen System Feld Presets id's zurück
   */
  public getAllSystemFields(): string[] {
    return this.engine.getAllSystemFields();
  }

  //History

  /**
   * Macht die letzte Aktion rückgänig
   */
  public undo(): void {
    this.engine.undo();
  }

  /**
   * Stellt die letzte Aktion wieder her
   */
  public redo(): void {
    this.engine.redo();
  }

  /**
   * Kann Rückgänig gemacht werden?
   * @returns {boolean} `boolean`
   */
  public canUndo(): boolean {
    return this.engine.canUndo();
  }

  /**
   * Kann Wiederhergestellt werden?
   * @returns {boolean} `boolean`
   */
  public canRedo(): boolean {
    return this.engine.canRedo();
  }

  /**
   * Abonniert ein Event.
   * @returns Eine Cleanup-Funktion (unsubscribe), die das Event wieder entfernt.
   */
  public on<T extends keyof PublicPlaybookEventMap>(
    event: T,
    callback: (payload: PublicPlaybookEventMap[T]) => void,
  ): () => void {
    return this.engine.on(event, callback);
  }
}
