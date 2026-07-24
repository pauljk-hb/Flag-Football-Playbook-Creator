import type { FieldPreset } from "../../types/presets";

export const PIXELS_PER_YARD = 20;
export const DEFAULT_LOS_Y = 600;

export const SYSTEM_FIELDS: Record<string, FieldPreset> = {
    STANDARD: {
        id: 'STANDARD',
        name: 'Standard (LOS + 15 Yards)',
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
        lines: [
            { yardsFromLos: 0, type: 'los' },
            { yardsFromLos: 10, type: 'endzone' }
        ]
    }
    // Hier kannst du später 1-Point Try etc. ergänzen
};