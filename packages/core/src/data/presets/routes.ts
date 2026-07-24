import type { RoutePreset } from '../../types/presets.js';
import { PIXELS_PER_YARD } from './fields.js';

const yards = (yards: number) => {
  return yards * PIXELS_PER_YARD * (-1);
};

export const SYSTEM_ROUTES: Record<string, RoutePreset> = {
  QUICK_OUT: {
    id: 'QUICK_OUT',
    name: 'Quick Out',
    waypoints: [{ dx: yards(10), dy: yards(3) }]
  },
  SLANT: {
    id: 'SLANT',
    name: 'Slant',
    waypoints: [{ dx: 0, dy: yards(2)}, { dx: yards(10), dy: yards(1) }]
  },
  COMEBACK: {
    id: 'COME_BACK',
    name: 'Come Back',
    waypoints: [{ dx: 0, dy: yards(7) }, { dx: 20, dy: 20 }]
  },
  HITCH: {
    id: 'HITCH',
    name: 'Hitch',
    waypoints: [{ dx: 0, dy: yards(7)}, { dx: -20, dy: 20 }]
  },
  IN: {
    id: 'IN',
    name: 'In',
    waypoints: [{ dx: 0, dy: yards(7)}, { dx: yards(10), dy: 0 }]
  },
  OUT: {
    id: 'OUT',
    name: 'Out',
    waypoints: [{ dx: 0, dy: yards(7)}, { dx: yards(-10), dy: 0 }]
  },
  POST: {
    id: 'POST',
    name: 'Post',
    waypoints: [{ dx: 0, dy: yards(7)}, { dx: yards(4), dy:  yards(4)}]
  },
  CORNER: {
    id: 'CORNER',
    name: 'Corner',
    waypoints: [{ dx: 0, dy: yards(7)}, { dx: yards(-4), dy: yards(4) }]
  },
  GO: {
    id: 'GO',
    name: 'Go / Fly',
    waypoints: [{ dx: 0, dy: yards(13) }]
  }
};