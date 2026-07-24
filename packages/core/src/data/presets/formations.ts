import type { FormationPreset } from '../../types/presets.js';

export const SYSTEM_FORMATIONS: Record<string, FormationPreset> = {
  EMPTY_LEFT: {
    id: 'EMPTY_LEFT',
    name: 'Empty Left',
    positions: [
      { playerPresetId: 'CENTER', dx: 0, dy: 0 },
      { playerPresetId: 'QB', dx: 0, dy: 60 },
      { playerPresetId: 'WR1', dx: -300, dy: 0 },
      { playerPresetId: 'WR2', dx: 300, dy: 0 },
      { playerPresetId: 'RED', dx: -150, dy: 0 },
    ]
  },
  EMPTY_RIGHT: {
    id: 'EMPTY_RIGHT',
    name: 'Empty Right',
    positions: [
      { playerPresetId: 'CENTER', dx: 0, dy: 0 },
      { playerPresetId: 'QB', dx: 0, dy: 60 },
      { playerPresetId: 'WR1', dx: -300, dy: 0 },
      { playerPresetId: 'WR2', dx: 300, dy: 0 },
      { playerPresetId: 'RED', dx: 150, dy: 0 },
    ]
  },
  TOWER_LEFT: {
    id: 'TOWER_LEFT',
    name: 'Tower Left',
    positions: [
      { playerPresetId: 'CENTER', dx: 0, dy: 0 },
      { playerPresetId: 'QB', dx: 0, dy: 60 },
      { playerPresetId: 'WR1', dx: -300, dy: 0 },
      { playerPresetId: 'WR2', dx: 300, dy: 0 },
      { playerPresetId: 'RED', dx: -250, dy: 0 },
    ]
  },
  TOWER_RIGHT: {
    id: 'TOWER_RIGHT',
    name: 'Tower Right',
    positions: [
      { playerPresetId: 'CENTER', dx: 0, dy: 0 },
      { playerPresetId: 'QB', dx: 0, dy: 60 },
      { playerPresetId: 'WR1', dx: -300, dy: 0 },
      { playerPresetId: 'WR2', dx: 300, dy: 0 },
      { playerPresetId: 'RED', dx: 250, dy: 0 },
    ]
  },
};