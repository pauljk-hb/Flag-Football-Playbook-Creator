import type { Point2D } from "./domain";

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface PolylineMetrics {
  width: number;
  height: number;
  pathOffset: Point2D;
  dx: number;
  dy: number;
}
