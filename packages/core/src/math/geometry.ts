import type { BoundingBox, IPoint, PolylineMetrics } from "../types/math";

/**
 * Ermittelt die extremsten Punkte einer Reihe von Koordinaten.
 */
export function calculateBoundingBox(points: IPoint[]): BoundingBox {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Findet den exakten Mittelpunkt einer Bounding Box.
 */
export function calculateCenterPoint(box: BoundingBox): IPoint {
  return {
    x: box.minX + box.width / 2,
    y: box.minY + box.height / 2,
  };
}

/**
 * Berechnet die Distanz zwischen zwei Punkten.
 */
export function calculateDistance(start: IPoint, end: IPoint): number {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

/**
 * Berechnet den Winkel zwischen zwei Punkten in Grad.
 * (0° = rechts, 90° = unten, 180° = links, -90° = oben)
 */
export function calculateAngleInDegrees(p1: IPoint, p2: IPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Richtet einen Wert an einem Raster aus.
 */
export function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Wandelt einen relativen (lokalen) Punkt einer Polyline in einen
 * absoluten Punkt auf dem gesamten Spielfeld (Canvas) um.
 */
export function localToAbsolutePosition(
  localPoint: IPoint,
  elementLeft: number,
  elementTop: number,
  pathOffset: IPoint,
): IPoint {
  return {
    x: elementLeft + (localPoint.x - pathOffset.x),
    y: elementTop + (localPoint.y - pathOffset.y),
  };
}

/**
 * Berechnet die neuen Dimensionen und die Verschiebung (Offset) einer Polyline,
 * wenn sich ihre Punkte geändert haben.
 */
export function calculatePolylineMetrics(
  newPoints: IPoint[],
  currentPathOffset: IPoint,
): PolylineMetrics {
  const box = calculateBoundingBox(newPoints);
  const newCenter = calculateCenterPoint(box);

  return {
    width: box.width,
    height: box.height,
    pathOffset: newCenter,
    dx: newCenter.x - currentPathOffset.x,
    dy: newCenter.y - currentPathOffset.y,
  };
}

/**
 * Berechnet die exakte absolute Position und den Rotationswinkel für eine Pfeilspitze
 * anhand des letzten Liniensegments einer Route.
 */
export function calculateArrowheadMetrics(
  points: IPoint[],
  elementLeft: number,
  elementTop: number,
  pathOffset: IPoint,
): { x: number; y: number; angle: number } {
  if (!points || points.length < 2) {
    return { x: elementLeft, y: elementTop, angle: 0 };
  }

  const p1Local = points[points.length - 2]!;
  const p2Local = points[points.length - 1]!;

  const p1Abs = localToAbsolutePosition(
    p1Local,
    elementLeft,
    elementTop,
    pathOffset,
  );
  const p2Abs = localToAbsolutePosition(
    p2Local,
    elementLeft,
    elementTop,
    pathOffset,
  );

  // Basis-Winkel berechnen
  const baseAngle = calculateAngleInDegrees(p1Abs, p2Abs);

  // Vektor-Winkel (Math.atan2) beginnt rechts. SVG/Fabric-Dreiecke zeigen oft
  // standardmäßig nach oben. Daher +90 Grad, damit die Spitze in Laufrichtung zeigt.
  const adjustedAngle = baseAngle + 90;

  return {
    x: p2Abs.x,
    y: p2Abs.y,
    angle: adjustedAngle,
  };
}

/**
 * Beschränkt (clampt) eine X/Y-Koordinate so, dass das Objekt mit seiner Breite/Höhe
 * nicht über die definierten Grenzen (Bounds) hinausragt.
 */
export function clampPositionWithinBounds(
  x: number,
  y: number,
  objWidth: number,
  objHeight: number,
  boundsWidth: number,
  boundsHeight: number,
  originIsCenter: boolean = false,
): IPoint {
  let minX = 0;
  let minY = 0;
  let maxX = boundsWidth - objWidth;
  let maxY = boundsHeight - objHeight;

  if (originIsCenter) {
    minX = objWidth / 2;
    minY = objHeight / 2;
    maxX = boundsWidth - objWidth / 2;
    maxY = boundsHeight - objHeight / 2;
  }

  return {
    x: Math.max(minX, Math.min(x, maxX)),
    y: Math.max(minY, Math.min(y, maxY)),
  };
}
