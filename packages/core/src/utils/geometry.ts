import { SegmentType, type Point2D, type RouteNode } from "../types/domain";
import type { BoundingBox, PolylineMetrics } from "../types/math";

/**
 * Ermittelt die extremsten Punkte einer Reihe von Koordinaten.
 */
export function calculateBoundingBox(points: Point2D[]): BoundingBox {
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
export function calculateCenterPoint(box: BoundingBox): Point2D {
  return {
    x: box.minX + box.width / 2,
    y: box.minY + box.height / 2,
  };
}

/**
 * Berechnet die Distanz zwischen zwei Punkten.
 */
export function calculateDistance(start: Point2D, end: Point2D): number {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

/**
 * Berechnet den Winkel zwischen zwei Punkten in Grad.
 * (0° = rechts, 90° = unten, 180° = links, -90° = oben)
 */
export function calculateAngleInDegrees(p1: Point2D, p2: Point2D): number {
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
 * Rastet einen Wert (z.B. eine Koordinate) auf ein Ziel ein,
 * wenn er sich innerhalb des Schwellenwerts (Threshold) befindet.
 */
export function snapToCoordinate(
  value: number,
  target: number,
  threshold: number,
): number {
  if (Math.abs(value - target) < threshold) {
    return target;
  }
  return value;
}

/**
 * Wandelt einen relativen (lokalen) Punkt einer Polyline in einen
 * absoluten Punkt auf dem gesamten Spielfeld (Canvas) um.
 */
export function localToAbsolutePosition(
  localPoint: Point2D,
  elementLeft: number,
  elementTop: number,
  pathOffset: Point2D,
): Point2D {
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
  newPoints: Point2D[],
  currentPathOffset: Point2D,
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
export function calculateArrowheadMetrics(nodes: RouteNode[]) {
  const lastNode = nodes[nodes.length - 1];
  const prevNode = nodes[nodes.length - 2];

  if (!lastNode || !prevNode) {
    throw new Error("Not enough nodes to calculate arrowhead metrics.");
  }

  const absPosition = lastNode.position;

  let angle = calculateAngleInDegrees(prevNode.position, lastNode.position);

  if (lastNode.type === SegmentType.CURVE && lastNode.cpIn) {
    angle = calculateAngleInDegrees(lastNode.cpIn, lastNode.position);
  }

  const finalAngle = angle + 90;
  return { position: absPosition, angle: finalAngle };
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
  canvasWidth: number,
  canvasHeight: number,
  originX: string = "center",
  originY: string = "center",
): { x: number; y: number } {
  const minX = originX === "center" ? objWidth / 2 : 0;
  const minY = originY === "center" ? objHeight / 2 : 0;
  const maxX =
    originX === "center" ? canvasWidth - objWidth / 2 : canvasWidth - objWidth;
  const maxY =
    originY === "center"
      ? canvasHeight - objHeight / 2
      : canvasHeight - objHeight;

  return {
    x: Math.max(minX, Math.min(x, maxX)),
    y: Math.max(minY, Math.min(y, maxY)),
  };
}

/**
 * Zwingt eine einzelne X/Y-Koordinate in die Grenzen des Canvas.
 * @param padding Puffer zum Rand (z.B. nützlich, damit Pfeilspitzen nicht halb abgeschnitten werden).
 */
export function clampPoint(
  p: Point2D,
  boundsWidth: number,
  boundsHeight: number,
  padding: number = 0,
): Point2D {
  return {
    x: Math.max(padding, Math.min(p.x, boundsWidth - padding)),
    y: Math.max(padding, Math.min(p.y, boundsHeight - padding)),
  };
}

/**
 * Sammelt alle relevanten Punkte eines Nodes (inkl. Kontrollpunkte) für die Bounding Box.
 */
function extractPointsFromNodes(nodes: RouteNode[]): Point2D[] {
  const points: Point2D[] = [];
  for (const node of nodes) {
    points.push(node.position);
    if (node.cpIn) {
      points.push(node.cpIn);
    }
    if (node.cpOut) {
      points.push(node.cpOut);
    }
  }
  return points;
}

/**
 * Prüft eine Route gegen die Canvas-Grenzen und staucht sie winkelgetreu,
 * falls Punkte oder Bezier-Handles über das Padding hinausragen.
 */
export function constrainRouteToCanvas(
  nodes: RouteNode[],
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 20,
): RouteNode[] {
  if (!nodes || nodes.length < 2) return nodes;

  const minX = padding;
  const maxX = canvasWidth - padding;
  const minY = padding;
  const maxY = canvasHeight - padding;

  const box = calculateBoundingBox(extractPointsFromNodes(nodes));
  const isOutOfBounds =
    box.minX < minX || box.maxX > maxX || box.minY < minY || box.maxY > maxY;

  if (!isOutOfBounds) return nodes;

  const startPosition = nodes[0].position;

  let scaleX = 1.0;
  let scaleY = 1.0;

  if (box.minX < minX && startPosition.x !== box.minX) {
    scaleX = Math.min(
      scaleX,
      (minX - startPosition.x) / (box.minX - startPosition.x),
    );
  }
  if (box.maxX > maxX && startPosition.x !== box.maxX) {
    scaleX = Math.min(
      scaleX,
      (maxX - startPosition.x) / (box.maxX - startPosition.x),
    );
  }

  if (box.minY < minY && startPosition.y !== box.minY) {
    scaleY = Math.min(
      scaleY,
      (minY - startPosition.y) / (box.minY - startPosition.y),
    );
  }
  if (box.maxY > maxY && startPosition.y !== box.maxY) {
    scaleY = Math.min(
      scaleY,
      (maxY - startPosition.y) / (box.maxY - startPosition.y),
    );
  }

  scaleX = Math.max(0, scaleX);
  scaleY = Math.max(0, scaleY);

  return nodes.map((node) => {
    const updatedNode: RouteNode = {
      ...node,
      position: {
        x: startPosition.x + (node.position.x - startPosition.x) * scaleX,
        y: startPosition.y + (node.position.y - startPosition.y) * scaleY,
      },
    };

    if (node.cpIn) {
      updatedNode.cpIn = {
        x: startPosition.x + (node.cpIn.x - startPosition.x) * scaleX,
        y: startPosition.y + (node.cpIn.y - startPosition.y) * scaleY,
      };
    }

    if (node.cpOut) {
      updatedNode.cpOut = {
        x: startPosition.x + (node.cpOut.x - startPosition.x) * scaleX,
        y: startPosition.y + (node.cpOut.y - startPosition.y) * scaleY,
      };
    }

    return updatedNode;
  });
}
