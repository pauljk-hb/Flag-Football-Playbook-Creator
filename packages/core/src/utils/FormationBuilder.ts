import { FORMATION_PRESETS } from "../data/presets/index";
import type { PlayerDTO, PlayerStyle } from "../types/domain";

export type FormationSpawnData = Omit<PlayerDTO, "id">;

export class FormationBuilder {
  /**
   * Wandelt ein relatives Formation-Preset in absolute Spawn-Daten um.
   * Keine Canvas- oder State-Abhängigkeiten! Rein funktionale Datenwandlung.
   */
  public static build(
    formationId: string,
    playerStyles: Record<string, PlayerStyle>,
    originX: number,
    originY: number,
  ): FormationSpawnData[] {
    const formation = FORMATION_PRESETS[formationId];
    if (!formation) return [];

    const spawnData: FormationSpawnData[] = [];

    formation.positions.forEach((pos) => {
      const roleKey = pos.playerPresetId;
      const style: PlayerStyle = playerStyles[roleKey] || {
        color: "#3b82f6",
        label: roleKey,
        shape: "circle",
        showLabels: true,
      };

      spawnData.push({
        roleId: roleKey,
        position: { x: originX + pos.dx, y: originY + pos.dy },
      });
    });

    return spawnData;
  }
}
