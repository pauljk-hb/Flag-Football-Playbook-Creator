import { FORMATION_PRESETS, FIELDS_PRESETS, PLAYER_PRESETS } from '../data/presets/index';
import type { EntityManager } from './EntityManager.js';
import { PlayerEntity } from '../entities/PlayerEntity.js';
import * as fabric from 'fabric';

export class FormationManager {
  constructor(
    private entityManager: EntityManager,
    private canvas: fabric.Canvas,
    private currentFieldPresetId: string // Optional, falls du das Feld-Preset hier brauchst
  ) {}

  public clearAllPlayers(): void {
    const players = this.entityManager.getAllPlayers();
    
    players.forEach(player => {
        if (player.fabricObject) this.canvas.remove(player.fabricObject);
        if (player.route?.fabricObject) this.canvas.remove(player.route.fabricObject);
    });

    this.entityManager.clear();
    this.canvas.requestRenderAll();
  }

  public applyFormationData(formationId: string, customX?: number, customY?: number): void {
    const formation = FORMATION_PRESETS[formationId];
    if (!formation) return;

    let originX = customX;
    let originY = customY;

    if (originX === undefined || originY === undefined) {
        const fieldConfig = FIELDS_PRESETS[this.currentFieldPresetId] || FIELDS_PRESETS['STANDARD'];
        originX = fieldConfig ? fieldConfig.anchor.x : 400; 
        originY = fieldConfig ? fieldConfig.anchor.y : 600; 
    }

    formation.positions.forEach(pos => {
      const playerPreset = PLAYER_PRESETS[pos.playerPresetId];
      if (!playerPreset) return;

      // Hier erstellst du die neue PlayerEntity (passe das an deine Factory/Klasse an)
      const player = new PlayerEntity({
        id: playerPreset.id, 
        x: originX! + pos.dx,
        y: originY! + pos.dy,
        label: playerPreset.label,
        color: playerPreset.color,
        shape: playerPreset.shape
      });

      this.entityManager.addPlayer(player);
      player.addToCanvas(this.canvas);
    });

    this.canvas.requestRenderAll();
  }

  public restorePlayers(players: PlayerEntity[]): void {
    players.forEach(player => {
      this.entityManager.addPlayer(player);
      
      player.addToCanvas(this.canvas);
      if (player.route) {
          player.route.addToCanvas(this.canvas);
      }
    });
    
    this.canvas.requestRenderAll();
  }

  public getAllPlayers(): PlayerEntity[] {
    return this.entityManager.getAllPlayers();
  }
}