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

export class PlaybookEngine {
  private canvas: fabric.Canvas | null = null;
  public readonly entityManager: EntityManager;
  public readonly history: HistoryManager;

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
    const formation = SYSTEM_FORMATIONS[formationId];
    
    if (!formation) {
      console.warn(`Formation ${formationId} nicht gefunden!`);
      return;
    }

    let originX = customX;
    let originY = customY;

    if (originX === undefined || originY === undefined) {
        const currentFieldId = this.currentFieldPresetId || 'STANDARD';
        const fieldConfig = SYSTEM_FIELDS[currentFieldId];
        
        originX = fieldConfig ? fieldConfig.anchor.x : 400; 
        originY = fieldConfig ? fieldConfig.anchor.y : 600; 
    }

    this.clearAllPlayers(); 

    formation.positions.forEach(pos => {
      const playerPreset = SYSTEM_PLAYERS[pos.playerPresetId];
      if (!playerPreset) {
          console.warn(`Spieler-Preset ${pos.playerPresetId} fehlt!`);
          return;
      }

      const absoluteX = originX + pos.dx;
      const absoluteY = originY + pos.dy;

      this.addPlayer({
        id: playerPreset.id, 
        x: absoluteX,
        y: absoluteY,
        label: playerPreset.label,
        color: playerPreset.color,
        shape: playerPreset.shape
      });
    });

    this.renderCanvas();
  }

  public clearAllPlayers(): void {
    if (!this.entityManager || !this.canvas) return;

    // 1. Hole alle aktuellen Spieler aus dem Manager
    const players = this.entityManager.getAllPlayers();

    // 2. Entferne die Fabric-Objekte jedes Spielers vom Canvas
    players.forEach(player => {
        // HINWEIS: Hier musst du die Eigenschaft anpassen, in der dein 
        // PlayerEntity das Fabric-Objekt (z.B. die Group) speichert. 
        // Ich nenne es hier beispielhaft 'fabricObject' oder 'group'.
        
        if (player.fabricObject) { // <- Passe den Namen ggf. an deine PlayerEntity an
            this.canvas!.remove(player.fabricObject);
        }

        // Falls der Spieler schon eine Route zugewiesen hat, 
        // muss die Linie ebenfalls vom Canvas!
        if (player.route && player.route.fabricObject) {
            this.canvas!.remove(player.route.fabricObject);
        }

        // Alternativ: Wenn deine PlayerEntity eine eigene Zerstör-Methode hat
        // (z.B. player.removeFromCanvas(this.canvas)), rufe diese hier auf.
    });

    // 3. Jetzt erst die interne Datenstruktur leeren
    this.entityManager.clear();
    
    // 4. Canvas aktualisieren, damit die Geister verschwinden
    this.canvas.requestRenderAll();
}

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