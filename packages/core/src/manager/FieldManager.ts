import { Canvas, FabricObject, Line } from 'fabric';
import { SYSTEM_FIELDS, PIXELS_PER_YARD, DEFAULT_LOS_Y } from '../data/presets/fields';
import type { FieldLineConfig } from '../types/presets';

export class FieldManager {
    private canvas: Canvas;
    private fieldObjects: FabricObject[] = [];

    constructor(canvas: Canvas) {
        this.canvas = canvas;
    }

    public drawField(presetId: string): void {
        const preset = SYSTEM_FIELDS[presetId];
        if (!preset) return;

        this.clearField();

        const LINE_START = -1000;
        const LINE_END = 5000;

        preset.lines.forEach((lineConfig: FieldLineConfig) => {
            const yPos = DEFAULT_LOS_Y - (lineConfig.yardsFromLos * PIXELS_PER_YARD);

            let strokeColor = '#ffffff';
            let strokeWidth = 2;
            let dashArray: number[] | undefined = undefined;

            if (lineConfig.type === 'los') {
                strokeColor = '#121212';
                strokeWidth = 4;
            } else if (lineConfig.type === 'endzone') {
                strokeColor = '#ef4444';
                strokeWidth = 4;
            } else if (lineConfig.type === 'yardline') {
                strokeColor = '#94a3b8';
                strokeWidth = 2;
                dashArray = [10, 5];
            }

            const fabricLine = new Line([LINE_START, yPos, LINE_END, yPos], {
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: dashArray,
                selectable: false,
                evented: false,
                hoverCursor: 'default'
            });

            this.fieldObjects.push(fabricLine);
            this.canvas.add(fabricLine);
            
            this.canvas.sendObjectToBack(fabricLine);
        });

        this.canvas.requestRenderAll();
    }

    public clearField(): void {
        this.fieldObjects.forEach(obj => this.canvas.remove(obj));
        this.fieldObjects = [];
    }
}