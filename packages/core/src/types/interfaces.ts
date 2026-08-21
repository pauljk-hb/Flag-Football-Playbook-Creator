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

export interface PlayerStyleOverride {
  color?: string;
  label?: string;
  showLabel?: boolean;
  shape?: "circle" | "square";
}

export interface PlayerStyle {
  color: string;
  label: string;
  showLabel: boolean;
  shape: "circle" | "square";
}

export interface RouteExportData {
  id: string;
  playerId: string;
  routeType: string;
  color: string;
  nodes: RouteNode[];
}

export interface PlayerImportData {
  id?: string;
  role: string;
  x: number;
  y: number;
  style: PlayerStyle;
  styleOverride?: PlayerStyleOverride;
}

export interface PlayImportData {
  fieldPresetId: string;
  players: PlayerImportData[];
  routes: RouteExportData[];
}

export interface PlayerExportData {
  id: string;
  role: string;
  x: number;
  y: number;
  styleOverride?: PlayerStyleOverride;
}

export interface PlaySavePayload {
  fieldPresetId: string;
  players: PlayerExportData[];
  routes: RouteExportData[];
}

export interface ThumbnailOptions {
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  width?: number;
}

export type LogLevel = "info" | "success" | "warning" | "error";

export interface CoreNotification {
  level: LogLevel;
  message: string;
  messageKey?: string;
}

export type PlaybookMode = "editor" | "viewer";
