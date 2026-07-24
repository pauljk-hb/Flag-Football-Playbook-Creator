import type { RoutePreset } from '../../types/presets.js';

export const SYSTEM_ROUTES: Record<string, RoutePreset> = {
  OUT: {
    id: 'OUT',
    name: 'Qick Out',
    waypoints: [{ dx: 50, dy: -70 }]
  },
  SLANT: {
    id: 'SLANT',
    name: 'Slant',
    waypoints: [{ dx: 0, dy: -20 }, { dx: 50, dy: -70 }]
  },
  COMEBACK: {
    id: 'COME_BACK',
    name: 'Come Back',
    waypoints: [{ dx: 0, dy: -80 }, { dx: 20, dy: 20 }]
  },
  HITCH: {
    id: 'HITCH',
    name: 'Hitch',
    waypoints: [{ dx: 0, dy: -20 }, { dx: 50, dy: -70 }]
  },
  GO: {
    id: 'GO',
    name: 'Go / Fly',
    waypoints: [{ dx: 0, dy: -150 }]
  }
  // ... hier kommt dein gesamter Route Tree rein
};