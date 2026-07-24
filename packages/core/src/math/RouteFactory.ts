import { RouteEntity } from '../entities/RouteEntity.js';
import type { RoutePreset } from '../types/presets.js';

export class RouteFactory {
  /**
   * Erstellt eine Route basierend auf einem Preset (relative dx/dy Punkte)
   */
  public static createFromPreset(
    startX: number, 
    startY: number, 
    preset: RoutePreset, 
    playerColor: string
  ): RouteEntity {
    
    const absolutePoints = [{ x: startX, y: startY }];

    let currentX = startX;
    let currentY = startY;

    for (const waypoint of preset.waypoints) {
      currentX += waypoint.dx;
      currentY += waypoint.dy;
      absolutePoints.push({ x: currentX, y: currentY });
    }

    return new RouteEntity({
      points: absolutePoints,
      color: playerColor,
    });
  }
}