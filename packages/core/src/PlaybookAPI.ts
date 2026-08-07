import { PlaybookEngine } from "./engine/PlaybookEngine";
import type { PlayerConfig } from "./entities/PlayerEntity";
import type { ThumbnailOptions } from "./types/interfaces";
import type { RoutePreset } from "./types/presets";

/**
 * Die PlaybookAPI ist die Fassade für das Frontend.
 * Liefert alle Funktionalität für die Playbook/Core
 * Sie exponiert keine internen Manager oder Entitäten, sondern nur DTOs und primitive Datentypen.
 * @param {HTMLCanvasElement} [canvas] html Canvas in der die Playbook Engine initzialisiert wird.
 */
export class PlaybookAPI {
  private engine: PlaybookEngine;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new PlaybookEngine();
    this.engine.init(canvas);
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

  //Entity's on Canvas
  /**
   * Fügt einen neuen Spieler hinzu.
   * @param {PlayerConfig} [config] Konfiguration für einen neuen Spieler
   */
  public addPlayer(config: PlayerConfig): void {
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
    customX?: number,
    customY?: number,
  ): void {
    this.engine.loadFormation(formationId, customX, customY);
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
   * Aboniert über Änderungen im History Stack (undo/redo)
   */
  public subscribeToHistoryChanges(callback: () => void): () => void {
    const unsubscribe = this.engine.subscribeToHistoryChanges(callback);
    return unsubscribe;
  }
}
