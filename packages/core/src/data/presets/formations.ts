import type { FormationPreset } from "../../types/presets.js";

export const SYSTEM_FORMATIONS: Record<string, FormationPreset> = {
  EMPTY_LEFT: {
    id: "EMPTY_LEFT",
    name: "Empty Left",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: -150, dy: 0 },
    ],
  },
  EMPTY_RIGHT: {
    id: "EMPTY_RIGHT",
    name: "Empty Right",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: 150, dy: 0 },
    ],
  },
  TOWER_LEFT: {
    id: "TOWER_LEFT",
    name: "Tower Left",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: -250, dy: 0 },
    ],
  },
  TOWER_RIGHT: {
    id: "TOWER_RIGHT",
    name: "Tower Right",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: 250, dy: 0 },
    ],
  },
  COVER_LEFT: {
    id: "COVER_LEFT",
    name: "Cover Left",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: -60, dy: 0 },
    ],
  },
  COVER_RIGHT: {
    id: "COVER_RIGHT",
    name: "Cover Right",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: 60, dy: 0 },
    ],
  },
  TRIPS_LEFT: {
    id: "TRIPS_LEFT",
    name: "Trips Left",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: -60, dy: 0 },
      { playerPresetId: "RED", dx: -150, dy: 0 },
    ],
  },
  TRIPS_RIGHT: {
    id: "TRIPS_RIGHT",
    name: "Trips Right",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: 60, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: 150, dy: 0 },
    ],
  },
  SHOTGUN_LEFT: {
    id: "SHOTGUN_LEFT",
    name: "Shotgun Left",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: -60, dy: 60 },
    ],
  },
  SHOTGUN_RIGHT: {
    id: "SHOTGUN_RIGHT",
    name: "Shotgun Right",
    positions: [
      { playerPresetId: "CENTER", dx: 0, dy: 0 },
      { playerPresetId: "QB", dx: 0, dy: 60 },
      { playerPresetId: "WR1", dx: -300, dy: 0 },
      { playerPresetId: "WR2", dx: 300, dy: 0 },
      { playerPresetId: "RED", dx: 60, dy: 60 },
    ],
  },
};
