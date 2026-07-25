import * as fabric from 'fabric';
import type { ICommand } from '../../types/history';
import type { PlaybookEngine } from '../../engine/PlaybookEngine';
import type { FormationManager } from '../../manager/FormationManager';
import type { SavedPlay } from '../../types/interfaces';
import type { PlayerEntity } from '../../entities/PlayerEntity';
import { RouteFactory } from '../../math/RouteFactory';
import { AssignRouteCommand } from './AssignRouteCommand';

export class LoadPlayCommand implements ICommand {
  private previousPlayers: PlayerEntity[] = [];
  private previousFieldPreset: string;

  constructor(
    private engine: PlaybookEngine,
    private formationManager: FormationManager,
    private canvas: fabric.Canvas,
    private playData: SavedPlay
  ) {
    // Welches Feld war vorher aktiv? (Cast auf any, falls currentFieldPresetId private ist)
    this.previousFieldPreset = (this.engine as any).currentFieldPresetId || 'STANDARD'; 
  }

  public execute(): void {
    // 1. Vorherigen Zustand für Undo sichern (nur beim ersten Ausführen)
    if (this.previousPlayers.length === 0) {
      this.previousPlayers = this.formationManager.getAllPlayers();
    }

    // 2. Aktuelles Feld komplett räumen
    this.formationManager.clearAllPlayers();

    // 3. Feld-Typ anpassen
    this.engine.changeFieldPreset(this.playData.fieldPresetId);

    // 4. Gespeicherte Spieler & exakte Routen laden
    this.playData.players.forEach(savedPlayer => {
      // engine.addPlayer triggert den AddPlayerCommand intern nicht im HistoryStack, 
      // solange HistoryManager.isExecutingCommand = true ist!
      const playerId = this.engine.addPlayer(savedPlayer.config);
      const playerEntity = this.engine.entityManager.getPlayer(playerId);

      // Falls der Spieler eine Route hatte, laden wir die exakten Punkte
      if (playerEntity && savedPlayer.routeData && savedPlayer.routeData.points) {
        
        const newRouteEntity = RouteFactory.createFromPoints(
          playerEntity.x,
          playerEntity.y,
          savedPlayer.routeData.points,
          playerEntity.color,
        );

        // Damit zukünftige Änderungen an der geladenen Route im Undo-Stack landen
        newRouteEntity.onCommandGenerated = (command) => {
          this.engine.history.execute(command);
        };

        const oldRouteEntity = playerEntity.route;

        // Route manuell zuweisen (ohne neuen History-Eintrag, da wir bereits im LoadCommand sind)
        const command = new AssignRouteCommand(
          playerEntity, 
          newRouteEntity, 
          oldRouteEntity, 
          this.canvas
        );
        command.execute(); 
      }
    });

    this.canvas.requestRenderAll();
  }

  public undo(): void {
    // 1. Geladenen Spielzug entfernen
    this.formationManager.clearAllPlayers();

    // 2. Altes Feld wiederherstellen
    this.engine.changeFieldPreset(this.previousFieldPreset);

    // 3. Alte Spieler wiederherstellen
    if (this.previousPlayers.length > 0) {
      this.formationManager.restorePlayers(this.previousPlayers);
    }
  }
}