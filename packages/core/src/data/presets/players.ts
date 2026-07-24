import type { PlayerPreset } from '../../types/presets.js';

export const SYSTEM_PLAYERS: Record<string, PlayerPreset> = {
  QB: { id: 'QB', label: 'QB', color: '#1a1b1b', shape: 'circle' },
  CENTER: { id: 'CENTER', label: 'C', color: '#3ce74d', shape: 'square' },
  WR1: { id: 'WR1', label: 'X', color: '#2e53cc', shape: 'circle' },
  WR2: { id: 'WR2', label: 'Z', color: '#2ebfcc', shape: 'circle' },
  RED: { id: 'RED', label: 'R', color: '#e63922', shape: 'circle' },
};