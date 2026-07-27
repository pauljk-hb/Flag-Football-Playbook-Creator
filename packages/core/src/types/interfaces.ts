export interface SavedPoint {
  x: number;
  y: number;
}

export interface SavedRoute {
  id: string;
  points: SavedPoint[];
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
  players: SavedPlayer[];
}

export interface ThumbnailOptions {
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  multiplier?: number;
}
