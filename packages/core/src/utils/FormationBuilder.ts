import type { NotificationManager } from "@/managers/NotificationManager";
import { FORMATION_PRESETS, PLAYER_PRESETS } from "../data/presets/index";
import type { PlayerSpawnData } from "../types/presets";

export class FormationBuilder {
  /**
   * Wandelt ein relatives Formation-Preset in absolute Spawn-Daten um.
   * Keine Canvas- oder State-Abhängigkeiten! Rein funktionale Datenwandlung.
   */
  public static build(
    formationId: string,
    originX: number,
    originY: number,
    notificationManager: NotificationManager,
  ): PlayerSpawnData[] {
    const formation = FORMATION_PRESETS[formationId];
    if (!formation) {
      console.warn(`Formation ${formationId} nicht gefunden!`);
      notificationManager.sendFeedback(
        "warning",
        `Formation ${formationId} nicht gefunden!`,
      );
      return [];
    }

    const spawnData: PlayerSpawnData[] = [];

    formation.positions.forEach((pos) => {
      const playerPreset = PLAYER_PRESETS[pos.playerPresetId];
      if (!playerPreset) return;

      spawnData.push({
        presetId: playerPreset.id,
        x: originX + pos.dx,
        y: originY + pos.dy,
        label: playerPreset.label,
        color: playerPreset.color,
        shape: playerPreset.shape,
      });
    });

    return spawnData;
  }
}
