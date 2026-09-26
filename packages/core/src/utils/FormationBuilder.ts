import type { PlayerImportData, PlayerStyle } from "@/types/interfaces";
import { FORMATION_PRESETS } from "../data/presets/index";

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
  ): PlayerImportData[] {
    const formation = FORMATION_PRESETS[formationId];
    if (!formation) return [];

    const spawnData: PlayerImportData[] = [];

    formation.positions.forEach((pos) => {
      const roleKey = pos.playerPresetId;
      const style: PlayerStyle = playerStyles[roleKey] || {
        color: "#3b82f6",
        label: roleKey,
        shape: "circle",
        showLabels: true,
      };

      spawnData.push({
        role: roleKey,
        x: originX + pos.dx,
        y: originY + pos.dy,
        style: { ...style },
      });
    });

    return spawnData;
  }
}
