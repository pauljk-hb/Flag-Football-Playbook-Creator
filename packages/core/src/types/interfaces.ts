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

export interface RouteExportData {
  id: string;
  playerId: string;
  routeType: string;
  color: string;
  nodes: RouteNode[];
}

export interface PlayerExportData {
  id: string;
  x: number;
  y: number;
  color: string;
  label: string;
  shape: "circle" | "square";
}

export interface PlayExportData {
  fieldPresetId: string;
  players: PlayerExportData[];
  routes: RouteExportData[];
}

export interface ThumbnailOptions {
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  multiplier?: number;
}

export type LogLevel = "info" | "success" | "warning" | "error";

export interface CoreNotification {
  level: LogLevel;
  message: string;
  messageKey?: string;
}
