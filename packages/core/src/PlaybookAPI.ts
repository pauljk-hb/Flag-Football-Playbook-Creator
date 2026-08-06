import { PlaybookEngine } from "./engine/PlaybookEngine";
import type { PlayerConfig } from "./entities/PlayerEntity";
import type { RouteNode, ThumbnailOptions } from "./types/interfaces";
import type { RoutePreset } from "./types/presets";

/**
 * Die PlaybookAPI ist die Fassade für das Frontend.
 * Sie exponiert keine internen Manager oder Entitäten, sondern nur DTOs und primitive Datentypen.
 */
export class PlaybookAPI {
  private engine: PlaybookEngine;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new PlaybookEngine();
    this.engine.init(canvas);
  }

  //Canvas Elemente
  public dispose(): void {
    this.engine.dispose();
  }

  public handleResize(containerWidth: number): void {
    this.engine.handleResize(containerWidth);
  }

  //Entity's on Canvas
  public addPlayer(config: PlayerConfig): void {
    this.engine.addPlayer(config);
  }

  public addRouteFromPreset(
    preset: RoutePreset,
    routeType: string = "default",
  ): void {
    this.engine.addRouteFromPreset(preset, routeType);
  }

  public deleteSelectedObject(): void {
    this.engine.deleteSelectedObject();
  }

  public loadFormation(
    formationId: string,
    customX?: number,
    customY?: number,
  ): void {
    this.engine.loadFormation(formationId, customX, customY);
  }

  public changeFieldPreset(presetId: string): void {
    this.engine.changeFieldPreset(presetId);
  }

  public exportPlay(): string {
    return this.engine.exportPlay();
  }

  public generateThumbnail(options: ThumbnailOptions = {}): string {
    return this.engine.generateThumbnail(options);
  }

  public loadPlay(jsonString: string): void {
    this.engine.loadPlay(jsonString);
  }

  //System Presets
  public getAllSystemFormations(): string[] {
    return this.engine.getAllSystemFormations();
  }

  public getAllSystemRoutes(): string[] {
    return this.engine.getAllSystemRoutes();
  }

  public getAllSystemFields(): string[] {
    return this.engine.getAllSystemFields();
  }

  //History
  public undo(): void {
    this.engine.undo();
  }

  public redo(): void {
    this.engine.redo();
  }

  public canUndo(): boolean {
    return this.engine.canUndo();
  }

  public canRedo(): boolean {
    return this.engine.canRedo();
  }

  public subscribeToHistoryChanges(callback: () => void): () => void {
    const unsubscribe = this.engine.subscribeToHistoryChanges(callback);
    return unsubscribe;
  }
}
