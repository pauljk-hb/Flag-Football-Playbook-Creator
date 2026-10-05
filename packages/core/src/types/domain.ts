export interface Point2D {
  x: number;
  y: number;
}

export enum SegmentType {
  STRAIGHT = "STRAIGHT",
  CURVE = "CURVE",
}
export type PlayerShape = "circle" | "square" | "triangle";

export interface PlayerStyle {
  color: string;
  label: string;
  showLabel: boolean;
  shape: PlayerShape;
}

export interface RouteStyle {
  color: string;
  thickness?: number;
  dashArray?: number[];
}

export interface RouteNode {
  position: Point2D;
  type: SegmentType;

  cpIn?: Point2D;
  cpOut?: Point2D;
}

export interface PlayerDTO {
  id: string;
  roleId: string;
  position: Point2D;
  styleOverride?: Partial<PlayerStyle>;
}

export interface RouteDTO {
  id: string;
  playerId: string;
  routeType: string;
  nodes: RouteNode[];
  style: RouteStyle;
}

export interface PlayDTO {
  version: number;

  fieldPresetId: string;
  players: PlayerDTO[];
  routes: RouteDTO[];
}
