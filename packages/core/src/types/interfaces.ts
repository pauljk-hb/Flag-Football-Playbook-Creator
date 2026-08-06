export interface SavedPoint {
  x: number;
  y: number;
}

export enum SegmentType {
  STRAIGHT = "STRAIGHT",
  CURVE = "CURVE",
}

export interface RouteNode {
  x: number;
  y: number;
  type: SegmentType;

  // Control Points für Bezier Curves (kommen an, z.B. C-Befehl in SVG)
  cpInX?: number;
  cpInY?: number;

  // Optional: Falls ausgehende Control Points gebraucht werden
  cpOutX?: number;
  cpOutY?: number;
}

export interface SavedRoute {
  id: string;
  points: RouteNode[];
  color: string;
}

export interface SavedPlayer {
  id: string;
  x: number;
  y: number;
  color: string;
  label: string;
  shape: "circle" | "square";
}

export interface SavedPlay {
  fieldPresetId: string;
  players: SavedPlayer[];
}

export interface ThumbnailOptions {
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  multiplier?: number;
}
