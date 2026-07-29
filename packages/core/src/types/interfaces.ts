export interface SavedPoint {
  x: number;
  y: number;
}

export enum SegmentType {
  LINE = "line",
  CURVE = "curve",
}

export interface RouteNode {
  id: string;
  x: number;
  y: number;
  type: SegmentType;

  controlPointIn?: { x: number; y: number };
  controlPointOut?: { x: number; y: number };
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
  route: SavedRoute | null;
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
