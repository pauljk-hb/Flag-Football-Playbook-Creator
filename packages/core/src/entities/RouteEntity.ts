import * as fabric from 'fabric';
import { BaseEntity } from './BaseEntity.js';
import { calculateArrowPositionAndAngle } from '../math/geometry.js';
import { setupRouteControls } from './controls/routeControls.js';
import { MoveRouteCommand } from '../history/commands/MoveCommands.js';
import type { ICommand } from '../types/history.js';

export interface RouteConfig {
  id?: string;
  points: { x: number; y: number }[];
  color: string;
}

export class RouteEntity extends BaseEntity {
  public fabricObject: fabric.Polyline;
  public arrowHead: fabric.Triangle;

  public onCommandGenerated?: (command: ICommand) => void;
  private dragStartPoints: { x: number; y: number }[] | null = null;

  constructor(config: RouteConfig) {
    super(config.id);

    this.fabricObject = new fabric.Polyline(config.points, {
      fill: 'transparent',
      stroke: config.color,
      strokeWidth: 4,
      objectCaching: false,
      hasBorders: false,
      hasControls: true,
      perPixelTargetFind: true,
      targetFindTolerance: 12,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'pointer', 
      moveCursor: 'pointer',
    });

    this.arrowHead = new fabric.Triangle({
      width: 14,
      height: 14,
      fill: config.color,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    this.updateArrow();
    this.setupEvents();
    setupRouteControls(this);
  }

  public addToCanvas(canvas: fabric.Canvas): void {
    canvas.add(this.fabricObject, this.arrowHead);
  }

  public removeFromCanvas(canvas: fabric.Canvas): void {
    canvas.remove(this.fabricObject, this.arrowHead);
  }
  
  /** Wird vom Spieler aufgerufen, wenn dieser verschoben wird */
  public translate(dx: number, dy: number): void {
    const currentLeft = this.fabricObject.left ?? 0;
    const currentTop = this.fabricObject.top ?? 0;

    this.fabricObject.set({
      left: currentLeft + dx,
      top: currentTop + dy,
    });
    
    this.fabricObject.setCoords(); 
    
    this.updateArrow();
  }

  public updateArrow(): void {
    const { x, y, angle } = calculateArrowPositionAndAngle(this.fabricObject);
    this.arrowHead.set({ left: x, top: y, angle: angle });
    
    if (this.arrowHead.canvas) {
      this.arrowHead.canvas.requestRenderAll();
    }
  }

  public updatePoints(newPoints: { x: number; y: number }[]): void {
    const polyObj = this.fabricObject;
    
    const xs = newPoints.map((p) => p.x);
    const ys = newPoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const newWidth = maxX - minX;
    const newHeight = maxY - minY;
    const newPathOffset = new fabric.Point(minX + newWidth / 2, minY + newHeight / 2);

    const dx = newPathOffset.x - polyObj.pathOffset.x;
    const dy = newPathOffset.y - polyObj.pathOffset.y;

    polyObj.set({
      points: newPoints.map(p => new fabric.Point(p.x, p.y)),
      width: newWidth,
      height: newHeight,
      pathOffset: newPathOffset,
      left: (polyObj.left ?? 0) + dx,
      top: (polyObj.top ?? 0) + dy,
      dirty: true,
    });

    polyObj.setCoords();
    this.updateArrow();
    
    if (polyObj.canvas) {
      polyObj.canvas.requestRenderAll();
    }
  }

  private setupEvents(): void {
    this.fabricObject.on('mousedown', () => {
      this.dragStartPoints = this.fabricObject.points.map(p => ({ x: p.x, y: p.y }));
    });

    this.fabricObject.on('modified', () => {
      if (!this.dragStartPoints) return;
      
      const currentPoints = this.fabricObject.points.map(p => ({ x: p.x, y: p.y }));
      
      if (JSON.stringify(this.dragStartPoints) !== JSON.stringify(currentPoints)) {
        if (this.onCommandGenerated) {
          this.onCommandGenerated(new MoveRouteCommand(this, this.dragStartPoints, currentPoints));
        }
      }
      this.dragStartPoints = null;
    });
  }
}