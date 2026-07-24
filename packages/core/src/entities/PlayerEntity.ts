import * as fabric from 'fabric';
import { BaseEntity } from './BaseEntity.js';
import type { RouteEntity } from './RouteEntity';
import type { ICommand } from '../types/history.js';
import { MovePlayerCommand } from '../history/commands/MoveCommands.js';
import { DEFAULT_LOS_Y } from '../data/presets/fields.js';

export interface PlayerConfig {
  id?: string;
  x: number;
  y: number;
  label: string;
  color: string;
  shape: 'circle' | 'square';
}

export class PlayerEntity extends BaseEntity {
  public fabricObject: fabric.Group;
  public route: RouteEntity | null = null;

  public readonly label: string;
  public readonly color: string;
  
  private lastPosition: { x: number; y: number };
  private dragStartPos: { x: number; y: number } | null = null;

  public onCommandGenerated?: (command: ICommand) => void;

  constructor(config: PlayerConfig) {
    super(config.id);

    this.label = config.label;
    this.color = config.color;

    let backgroundShape: fabric.Object;
    
    if (config.shape === 'square') {
      backgroundShape = new fabric.Rect({
        width: 32,
        height: 32,
        fill: config.color,
        originX: 'center',
        originY: 'center',
        rx: 6,
        ry: 6
      });
    } else {
      backgroundShape = new fabric.Circle({
        radius: 16,
        fill: config.color,
        originX: 'center',
        originY: 'center'
      });
    }

    const text = new fabric.Text(config.label, {
      fontSize: 14,
      fill: '#ffffff',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
      fontFamily: 'sans-serif'
    });

    this.fabricObject = new fabric.Group([backgroundShape, text], {
      left: config.x,
      top: config.y,
      hasControls: false,
      hasBorders: false,
      originX: 'center',
      originY: 'center'
    });

    this.lastPosition = { x: config.x, y: config.y };
    this.setupEvents();
  }

  public get x(): number {
    return this.fabricObject.left ?? 0;
  }

  public get y(): number {
    return this.fabricObject.top ?? 0;
  }

  public setRoute(route: RouteEntity, canvas: fabric.Canvas): void {
    this.removeRoute(canvas);
    this.route = route;
    this.route.addToCanvas(canvas);

    canvas.bringObjectToFront(this.fabricObject);
  }

  public removeRoute(canvas: fabric.Canvas): void {
    if (this.route) {
      this.route.removeFromCanvas(canvas);
      this.route = null;
    }
  }

  private setupEvents(): void {
    this.fabricObject.on('mousedown', () => {
      this.dragStartPos = { 
        x: this.fabricObject.left ?? 0, 
        y: this.fabricObject.top ?? 0 
      };
    });

    this.fabricObject.on('moving', () => this.onMove());

    this.fabricObject.on('modified', () => this.onMoveComplete());

    this.fabricObject.on('selected', () => {
      this.fabricObject.set('shadow', new fabric.Shadow({
        color: '#FFD700', // Goldgelbes Leuchten
        blur: 15,
        offsetX: 0,
        offsetY: 0
      }));
      if (this.fabricObject.canvas) {
        this.fabricObject.canvas.requestRenderAll();
      }
    });

    this.fabricObject.on('deselected', () => {
      this.fabricObject.set('shadow', null); // Leuchten entfernen
      if (this.fabricObject.canvas) {
        this.fabricObject.canvas.requestRenderAll();
      }
    });
  }

  public setPosition(x: number, y: number): void {
    const currentX = this.fabricObject.left ?? 0;
    const currentY = this.fabricObject.top ?? 0;
    
    const dx = x - currentX;
    const dy = y - currentY;

    this.fabricObject.set({ left: x, top: y });
    this.fabricObject.setCoords();
    
    if (this.route) {
      this.route.translate(dx, dy);
    }
    
    this.lastPosition = { x, y };

    if (this.fabricObject.canvas) {
      this.fabricObject.canvas.requestRenderAll();
    }
  }

  private onMove(): void {
    const SNAP_THRESHOLD = 15;
    
    let currentX = this.fabricObject.left ?? 0;
    let currentY = this.fabricObject.top ?? 0;

    if (Math.abs(currentY - DEFAULT_LOS_Y) < SNAP_THRESHOLD) {
      currentY = DEFAULT_LOS_Y;
      this.fabricObject.set({ top: currentY }); 
    }

    const dx = currentX - this.lastPosition.x;
    const dy = currentY - this.lastPosition.y;

    if (this.route) {
      this.route.translate(dx, dy);
    }

    this.lastPosition = { x: currentX, y: currentY };
  }

  private onMoveComplete(): void {
    if (!this.dragStartPos) return;

    const currentPos = { 
      x: this.fabricObject.left ?? 0, 
      y: this.fabricObject.top ?? 0 
    };

    if (this.dragStartPos.x !== currentPos.x || this.dragStartPos.y !== currentPos.y) {
      if (this.onCommandGenerated) {
        this.onCommandGenerated(new MovePlayerCommand(this, this.dragStartPos, currentPos));
      }
    }
    this.dragStartPos = null;
  }
}