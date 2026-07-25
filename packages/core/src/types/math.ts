export interface IPoint {
  x: number;
  y: number;
}

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
  pathOffset: IPoint;
  dx: number;
  dy: number;
}
