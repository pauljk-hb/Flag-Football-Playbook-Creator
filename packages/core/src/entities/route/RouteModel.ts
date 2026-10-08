import { CANVAS } from "../../constants/constants";
import type { RouteDTO, RouteNode, RouteStyle } from "../../types/domain";
import { constrainRouteToCanvas } from "../../utils/geometry";
import { BaseModel } from "../base/BaseModel";

type RouteConstructorPayload = Omit<RouteDTO, "id"> & { id?: string };

export class RouteModel extends BaseModel {
  public playerId: string;
  public routeType: string;
  public nodes: RouteNode[];
  public style: RouteStyle;

  constructor(config: RouteConstructorPayload) {
    super(config.id);
    this.playerId = config.playerId;
    this.routeType = config.routeType;
    this.nodes = config.nodes;
    this.style = config.style;
  }

  /**
   * Wird aufgerufen (z.B. vom MovePlayerCommand), wenn der Spieler läuft.
   * Die Route muss sich synchron mitverschieben (reine Daten-Mutation).
   */
  public translate(dx: number, dy: number): void {
    this.nodes.forEach((node) => {
      node.position.x += dx;
      node.position.y += dy;
      if (node.cpIn) {
        node.cpIn.x += dx;
        node.cpIn.y += dy;
      }

      if (node.cpOut) {
        node.cpOut.x += dx;
        node.cpOut.y += dy;
      }
    });

    this.nodes = constrainRouteToCanvas(
      this.nodes,
      CANVAS.WIDTH,
      CANVAS.HEIGHT,
    );
  }

  /**
   * Wird vom Undo/Redo-System oder Sync aufgerufen, um einen neuen Zustand zu setzen.
   */
  public updateNodes(newNodes: RouteNode[]): void {
    this.nodes = JSON.parse(JSON.stringify(newNodes));
  }

  public serialize(): RouteDTO {
    return {
      id: this.id,
      playerId: this.playerId,
      routeType: this.routeType,
      style: this.style,
      nodes: JSON.parse(JSON.stringify(this.nodes)),
    };
  }
}
