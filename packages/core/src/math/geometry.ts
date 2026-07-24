import * as fabric from 'fabric';

/**
 * Berechnet die absolute X/Y-Position und den Winkel für die Pfeilspitze
 * basierend auf den letzten beiden Punkten einer Polyline.
 */
export function calculateArrowPositionAndAngle(
  poly: fabric.Polyline
): { x: number; y: number; angle: number } {
  const pts = poly.points;
  if (!pts || pts.length < 2) return { x: 0, y: 0, angle: 0 };

  const p1 = pts[pts.length - 2];
  const p2 = pts[pts.length - 1];

  if (!p1 || !p2) return { x: 0, y: 0, angle: 0 };

  const matrix = poly.calcTransformMatrix();
  const offset = poly.pathOffset;

  const absP1 = fabric.util.transformPoint(
    new fabric.Point(p1.x - offset.x, p1.y - offset.y),
    matrix
  );
  const absP2 = fabric.util.transformPoint(
    new fabric.Point(p2.x - offset.x, p2.y - offset.y),
    matrix
  );

  // Winkel berechnen
  const dx = absP2.x - absP1.x;
  const dy = absP2.y - absP1.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { x: absP2.x, y: absP2.y, angle: angle + 90 };
}