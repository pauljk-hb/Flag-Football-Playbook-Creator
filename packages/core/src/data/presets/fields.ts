import type { FieldPreset } from "../../types/presets";

export const PIXELS_PER_YARD = 25;
export const DEFAULT_LOS_Y = 400;

export const SYSTEM_FIELDS: Record<string, FieldPreset> = {
    STANDARD: {
        id: 'STANDARD',
        name: 'Standard (LOS + 15 Yards)',
        anchor: { x: 400, y: DEFAULT_LOS_Y },
        lines: [
            { yardsFromLos: 0, type: 'los' },
            { yardsFromLos: 5, type: 'yardline' },
            { yardsFromLos: 10, type: 'yardline' },
            { yardsFromLos: 15, type: 'yardline' }
        ]
    },
    TWO_POINT_TRY: {
        id: 'TWO_POINT_TRY',
        name: '2-Point Try',
        anchor: { x: 400, y: DEFAULT_LOS_Y },
        lines: [
            { yardsFromLos: 0, type: 'los' },
            { yardsFromLos: 5, type: 'yardline' },
            { yardsFromLos: 10, type: 'endzone' },
            { yardsFromLos: 15, type: 'endzone' }
        ]
    }
    // Hier kannst du später 1-Point Try etc. ergänzen
};