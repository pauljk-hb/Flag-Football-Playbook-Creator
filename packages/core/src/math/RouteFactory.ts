import { RouteEntity } from "../entities/RouteEntity.js";
import type { RoutePreset } from "../types/presets.js";

export class RouteFactory {
  /**
   * Erstellt eine Route basierend auf einem Preset (relative dx/dy Punkte)
   */
  public static createFromPreset(
    startX: number,
    startY: number,
    preset: RoutePreset,
    playerColor: string,
  ): RouteEntity {
    const absolutePoints = [{ x: startX, y: startY }];

    let currentX = startX;
    let currentY = startY;

    const isRightSide = startX > 400;
    let flipX = false;

    if (
      preset.breakDirection === "inside" ||
      preset.breakDirection === "outside"
    ) {
      if (isRightSide) {
        flipX = true;
      }
    }

    for (const waypoint of preset.waypoints) {
      const actualDx = flipX ? waypoint.dx : -waypoint.dx;

      currentX += actualDx;
      currentY += waypoint.dy;
      absolutePoints.push({ x: currentX, y: currentY });
    }

    return new RouteEntity({
      points: absolutePoints,
      color: playerColor,
    });
  }

  /**
   * Erstellt eine Route basierend auf exakten Array-Punkten
   */
  public static createFromPoints(
    originX: number,
    originY: number,
    points: { x: number; y: number }[],
    color: string,
  ): RouteEntity {
    const route = new RouteEntity({
      points: points,
      color: color,
    });

    return route;
  }

  /**
   * Spiegelt die X-Koordinaten einer Route.
   * Da die Punkte absolute Canvas-Koordinaten sind, spiegeln wir sie um den Startpunkt (originX).
   */
  private static mirrorRoutePoints(
    originX: number,
    points: { x: number; y: number }[],
  ): { x: number; y: number }[] {
    return points.map((p) => {
      // Abstand des Punktes zum Startpunkt der Route berechnen
      const dx = p.x - originX;
      // Den Abstand invertieren (-dx) und wieder auf den Startpunkt addieren
      return {
        x: originX - dx,
        y: p.y,
      };
    });
  }
}
