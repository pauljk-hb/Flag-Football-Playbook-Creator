import type { FormationPreset } from '../../types/presets.js';

export const SYSTEM_FORMATIONS: Record<string, FormationPreset> = {
  SPREAD_2x2: {
    id: 'SPREAD_2x2',
    name: 'Spread 2x2',
    positions: [
      { playerPresetId: 'CENTER', dx: 0, dy: 0 },
      { playerPresetId: 'QB', dx: 0, dy: 30 },
      { playerPresetId: 'WR1', dx: -300, dy: 0 },
      { playerPresetId: 'WR2', dx: 300, dy: 0 },
      { playerPresetId: 'RED', dx: -150, dy: 30 },
    ]
  }
};