export type EntityId = string;

export interface Point {
  x: number;
  y: number;
}

export interface PlayerDTO {
  id: EntityId;
  position: Point;
}

export interface RouteDTO {
  id: EntityId;
  playerId: EntityId;
  waypoints: Point[]; 
}