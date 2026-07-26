import {
  FORMATION_PRESETS,
  FIELDS_PRESETS,
  PLAYER_PRESETS,
} from "../data/presets/index";
import type { EntityManager } from "./EntityManager";
import type { CanvasManager } from "./CanvasManager";
import type { PlayerEntity } from "../entities/PlayerEntity";
import type { ICommand } from "../types/history";
import { SYSTEM_FORMATIONS } from "../data/presets/formations";

export class FormationManager {
  constructor(
    private entityManager: EntityManager,
    private canvasManager: CanvasManager,
    private currentFieldPresetId: string,
    private onEntityCommand: (cmd: ICommand) => void,
  ) {}

  /**
   * Räumt das komplette Feld ab (Daten und Canvas).
   * Hieß früher clearAllPlayers().
   */
  public clearField(): void {
    const players = this.entityManager.getAllPlayers();

    players.forEach((player) => {
      // Spieler vom Canvas nehmen
      player.getFabricObjects().forEach((obj) => {
        this.canvasManager.remove(obj);
      });
      // Falls er eine Route hatte, diese ebenfalls vom Canvas nehmen
      if (player.route) {
        player.route.getFabricObjects().forEach((obj) => {
          this.canvasManager.remove(obj);
        });
      }
    });

    // Map im EntityManager leeren
    this.entityManager.clear();

    // KEIN requestRenderAll() mehr hier! Das macht die History automatisch.
  }

  /**
   * Lädt eine neue Formation.
   * Hieß früher applyFormationData() und gibt jetzt die neuen Spieler zurück.
   */
  public loadFormation(
    formationId: string,
    customX?: number,
    customY?: number,
  ): PlayerEntity[] {
    const formation = FORMATION_PRESETS[formationId];
    if (!formation) return [];

    let originX = customX;
    let originY = customY;

    if (originX === undefined || originY === undefined) {
      const fieldConfig =
        FIELDS_PRESETS[this.currentFieldPresetId] || FIELDS_PRESETS["STANDARD"];
      originX = fieldConfig ? fieldConfig.anchor.x : 400;
      originY = fieldConfig ? fieldConfig.anchor.y : 600;
    }

    const newPlayers: PlayerEntity[] = [];

    formation.positions.forEach((pos) => {
      const playerPreset = PLAYER_PRESETS[pos.playerPresetId];
      if (!playerPreset) return;

      // 1. Spieler sauber über den EntityManager (Factory) erstellen lassen
      const player = this.entityManager.createPlayer(
        {
          id: playerPreset.id, // Hinweis: Bei Multi-Formationen evtl. UUIDs generieren, sonst gibt es ID-Konflikte!
          x: originX! + pos.dx,
          y: originY! + pos.dy,
          label: playerPreset.label,
          color: playerPreset.color,
          shape: playerPreset.shape,
        },
        this.onEntityCommand, // Das Wichtigste: Wir übergeben den Command-Hook der Engine!
      );

      // 2. Zustand aktualisieren
      this.entityManager.addPlayerToMap(player);

      // 3. Auf das Canvas packen
      player.getFabricObjects().forEach((obj) => {
        this.canvasManager.add(obj);
      });

      newPlayers.push(player);
    });

    return newPlayers;
  }

  /**
   * Stellt ein bereits existierendes Array von Spielern wieder her (für Undo/Redo).
   */
  public restorePlayers(players: PlayerEntity[]): void {
    players.forEach((player) => {
      // 1. Wieder in die Map legen
      this.entityManager.addPlayerToMap(player);

      // 2. Wieder aufs Canvas packen
      player.getFabricObjects().forEach((obj) => {
        this.canvasManager.add(obj);
      });

      // 3. Routen wiederherstellen und visuelles Layering fixen
      if (player.route) {
        player.route.getFabricObjects().forEach((obj) => {
          this.canvasManager.add(obj);
          this.canvasManager.sendToBack(obj);
        });

        player.getFabricObjects().forEach((obj) => {
          this.canvasManager.bringObjectToFront(obj);
        });
      }
    });
  }

  public getAllPlayers(): PlayerEntity[] {
    return this.entityManager.getAllPlayers();
  }

  public getAllSystemFormations(): string[] {
    return Object.keys(SYSTEM_FORMATIONS);
  }
}
