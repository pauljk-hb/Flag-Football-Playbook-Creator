import type { PlayDTO } from "@playbook/core/types";
export function migrateV1toV2(oldPlay: any): PlayDTO {
  if (oldPlay.version >= 2) return oldPlay;

  // Beispiel-Migration: Früher waren x/y flach, jetzt in 'position: Point'
  const upgradedPlayers = oldPlay.players.map((p: any) => ({
    id: p.id,
    role: p.role,
    position: { x: p.x, y: p.y }, // Transformation ins neue Point-Format
    style: p.style,
  }));

  return {
    ...oldPlay,
    version: 2, // Version anheben
    players: upgradedPlayers,
  };
}
