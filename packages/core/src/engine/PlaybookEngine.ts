import * as fabric from 'fabric';
import { EntityManager } from '../manager/EntityManager';
import { PlayerEntity, type PlayerConfig } from '../entities/PlayerEntity';
import { RouteFactory } from '../math/RouteFactory';
import { HistoryManager } from '../history/HistoryManager';
import { AddPlayerCommand } from '../history/commands/AddPlayerCommand';
import { AssignRouteCommand } from '../history/commands/AssignRouteCommand';
import { SYSTEM_ROUTES } from '../data/presets/routes';
import { SYSTEM_FORMATIONS } from '../data/presets/formations';
import { SYSTEM_PLAYERS } from '../data/presets/players';
import { FieldManager } from '../manager/FieldManager';
import { SYSTEM_FIELDS } from '../data/presets/fields';
import { FormationManager } from '../manager/FormationManager';
import { LoadFormationCommand } from '../history/commands/LoadFormationCommand';
import type { SavedPlay, SavedPlayerData } from '../types/interfaces';

export class PlaybookEngine {
  private canvas: fabric.Canvas | null = null;
  public readonly entityManager: EntityManager;
  public readonly history: HistoryManager;
  public formationManager!: FormationManager;

  private fieldManager: FieldManager | null = null;
  private currentFieldPresetId: string = 'STANDARD';

  public readonly LOGICAL_WIDTH = 800;
  public readonly LOGICAL_HEIGHT = 600;

  constructor() {
    this.entityManager = new EntityManager();
    this.history = new HistoryManager();
  }

  /**
   * Wird von React im useEffect aufgerufen.
   */
  public init(canvasElement: HTMLCanvasElement): void {
    this.canvas = new fabric.Canvas(canvasElement, {
      width: 800,
      height: 600,
      backgroundColor: '#f8fafc',
      selection: false,
    });

    this.formationManager = new FormationManager(
      this.entityManager, 
      this.canvas, 
      this.currentFieldPresetId
    );
    
    this.fieldManager = new FieldManager(this.canvas);
    this.fieldManager.drawField('STANDARD');

    this.canvas.renderAll();
  }

  /**
   * Cleanup für den React Unmount
   */
  public dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }

  /**
   * Wird von React aufgerufen, wenn sich das Fenster oder der Container ändert.
   * Passt die Canvas-Größe und den Zoom an, behält aber die logischen Koordinaten.
   */
  public handleResize(containerWidth: number): void {
    if (!this.canvas) return;

    const scale = containerWidth / this.LOGICAL_WIDTH;
    const newHeight = this.LOGICAL_HEIGHT * scale;

    this.canvas.setDimensions({ 
      width: containerWidth, 
      height: newHeight 
    });

    this.canvas.setZoom(scale);

    this.canvas.requestRenderAll();
  }

  // ==========================================
  // DOMAIN METHODEN (Aufgerufen von React)
  // ==========================================

  /**
   * Fügt einen neuen Spieler hinzu.
   * @returns Die ID des erstellten Spielers
   */
  public addPlayer(config: PlayerConfig): string {
    this.requireCanvas();

    const player = new PlayerEntity(config);

    player.onCommandGenerated = (command) => {
      this.history.execute(command);
    };
    
    const command = new AddPlayerCommand(player, this.canvas!, this.entityManager);
    this.history.execute(command);

    return player.id;
  }

  /**
   * Weist einem Spieler eine vorgefertigte oder leere Route zu.
   */
  public assignRouteToPlayer(playerId: string, routePresetId: string): void {
    const player = this.entityManager.getPlayer(playerId);
    if (!player) return;

    const routePreset = SYSTEM_ROUTES[routePresetId];
    if (!routePreset) {
      console.warn(`Route Preset ${routePresetId} nicht gefunden.`);
      return;
    }

    const newRouteEntity = RouteFactory.createFromPreset(
      player.x,
      player.y,
      routePreset,
      player.color
    );

    newRouteEntity.onCommandGenerated = (command) => {
      this.history.execute(command);
    };

    const oldRouteEntity = player.route;

    const command = new AssignRouteCommand(
      player, 
      newRouteEntity, 
      oldRouteEntity, 
      this.canvas!
    );
    
    this.history.execute(command);
    
    this.renderCanvas();
  }

  /**
   * Gibt die ID des aktuell ausgewählten Spielers zurück.
   */
  public getSelectedPlayerId(): string | null {
    if (!this.canvas) return null;
    
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return null;

    const player = this.entityManager.getAllPlayers().find(
      (p) => p.fabricObject === activeObject
    );

    return player ? player.id : null;
  }

  /**
   * Weist dem aktuell ausgewählten Spieler eine Route zu.
   */
  public assignRouteToSelectedPlayer(routePresetId: string): void {
    const selectedId = this.getSelectedPlayerId();
    
    if (!selectedId) {
      console.warn('Es ist kein Spieler ausgewählt!');
      return;
    }

    this.assignRouteToPlayer(selectedId, routePresetId);
  }

  public undo(): void {
    this.history.undo();
  }

  public redo(): void {
    this.history.redo();
  }

  public loadFormation(formationId: string, customX?: number, customY?: number): void {
    const command = new LoadFormationCommand(
      this.formationManager, 
      formationId, 
      customX, 
      customY
    );
    
    this.history.execute(command);
  }

  /**
   * Exportiert den gesamten aktuellen Zustand als JSON-String.
   */
  /*
    public savePlay(playName: string): string {
    const players = this.entityManager.getAllPlayers();
    
    const savedPlayers: SavedPlayerData[] = players.map(player => {
      const config: PlayerConfig = {
        id: player.id,
        x: player.x,
        y: player.y,
        label: player.label,
        color: player.color,
        shape: player.shape
      };

      let routeData = undefined;
      
      // Prüfen, ob eine Route existiert und Punkte hat
      if (player.route && player.route.fabricObject && player.route.fabricObject.points) {
        routeData = {
          presetId: (player.route as any).presetId || null,
          // Speichere die exakten X/Y Koordinaten des Fabric.js Objekts ab
          points: player.route.fabricObject.points.map(p => ({ x: p.x, y: p.y }))
        };
      }

      return { config, routeData };
    });

    const playData: SavedPlay = {
      id: crypto.randomUUID(), // Einzigartige ID
      name: playName,
      fieldPresetId: this.currentFieldPresetId,
      players: savedPlayers
    };

    return JSON.stringify(playData, null, 2);
  }
  */
  /**
   * Lädt einen zuvor gespeicherten Spielzug auf das Feld.
   */
  /*
  public loadPlay(jsonString: string): void {
    this.requireCanvas();
    
    try {
      const playData: SavedPlay = JSON.parse(jsonString);
      
      const command = new LoadPlayCommand(
        this,
        this.formationManager,
        this.canvas!, // Wird für die internen Route-Commands benötigt
        playData
      );

      // Führt das Command aus und schließt es als einen Eintrag in die History ein
      this.history.execute(command);
      
    } catch (error) {
      console.error("Fehler beim Laden des Spielzugs. Überprüfe das JSON-Format.", error);
    }
  }
*/
  public changeFieldPreset(presetId: string) {
    this.currentFieldPresetId = presetId;
    if (this.fieldManager) {
      this.fieldManager.drawField(presetId);
    }
  }

  // ==========================================
  // HILFSMETHODEN
  // ==========================================

  private requireCanvas(): void {
    if (!this.canvas) {
      throw new Error('PlaybookEngine is not initialized. Call init() first.');
    }
  }

  private renderCanvas(): void {
    if (this.canvas) {
      this.canvas.requestRenderAll();
    }
  }
}