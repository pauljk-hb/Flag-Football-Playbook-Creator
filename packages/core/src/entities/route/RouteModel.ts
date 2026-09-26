import { constrainRouteToCanvas } from "@/utils/geometry";
import { BaseModel } from "../base/BaseModel";

export class RouteModel extends BaseModel {
  public playerId: string;
  public routeType: string;
  public nodes: RouteNode[];
  public color: string;

  constructor(config: RouteConfig) {
    super(config.id);
    this.playerId = config.playerId;
    this.routeType = config.routeType;
    this.nodes = config.nodes;
    this.color = config.color;
  }

  /**
   * Wird aufgerufen (z.B. vom MovePlayerCommand), wenn der Spieler läuft.
   * Die Route muss sich synchron mitverschieben (reine Daten-Mutation).
   */
  public translate(dx: number, dy: number): void {
    this.nodes.forEach((node) => {
      node.x += dx;
      node.y += dy;
      if (node.cpInX !== undefined) node.cpInX += dx;
      if (node.cpInY !== undefined) node.cpInY += dy;
      if (node.cpOutX !== undefined) node.cpOutX += dx;
      if (node.cpOutY !== undefined) node.cpOutY += dy;
    });

    this.nodes = constrainRouteToCanvas(
      this.nodes,
      CANVAS_SIZE.width,
      CANVAS_SIZE.height,
    );
  }

  /**
   * Wird vom Undo/Redo-System oder Sync aufgerufen, um einen neuen Zustand zu setzen.
   */
  public updateNodes(newNodes: RouteNode[]): void {
    this.nodes = JSON.parse(JSON.stringify(newNodes));
  }

  public serialize(): RouteExportData {
    return {
      id: this.id,
      playerId: this.playerId,
      routeType: this.routeType,
      color: this.color,
      nodes: JSON.parse(JSON.stringify(this.nodes)),
    };
  }
}
