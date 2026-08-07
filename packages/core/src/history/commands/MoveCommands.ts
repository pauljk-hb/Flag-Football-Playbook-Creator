import type { PlayerEntity } from "../../entities/PlayerEntity";
import { RouteEntity } from "../../entities/RouteEntity";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { PlayManager } from "../../managers/PlayManager";
import type { ICommand } from "../../types/history";
import type { RouteNode } from "../../types/interfaces";

export class MovePlayerCommand implements ICommand {
  private dx: number;
  private dy: number;

  constructor(
    private playerId: string,
    private startX: number,
    private startY: number,
    private endX: number,
    private endY: number,
    private playMngr: PlayManager,
    private canvasMngr: CanvasManager,
  ) {
    this.dx = this.endX - this.startX;
    this.dy = this.endY - this.startY;
  }

  public execute(): void {
    const player = this.playMngr.getEntity<PlayerEntity>(this.playerId);
    if (!player) return;

    player.setPosition(this.endX, this.endY);

    this.playMngr.getAllRoutesFromPlayer(this.playerId).forEach((route) => {
      route.translate(this.dx, this.dy);
    });

    this.canvasMngr.requestRender();
  }

  public undo(): void {
    const player = this.playMngr.getEntity<PlayerEntity>(this.playerId);
    if (!player) return;

    player.setPosition(this.startX, this.startY);

    this.playMngr.getAllRoutesFromPlayer(this.playerId).forEach((route) => {
      route.translate(-this.dx, -this.dy);
    });

    this.canvasMngr.requestRender();
  }
}

export class MoveRouteCommand implements ICommand {
  private oldNodes: RouteNode[];
  private newNodes: RouteNode[];

  constructor(
    private routeId: string,
    oldNodes: RouteNode[],
    newNodes: RouteNode[],
    private playMngr: PlayManager,
    private canvasMngr: CanvasManager,
  ) {
    // Tiefe Kopie (Deep Copy) ist extrem wichtig, da Nodes Objekte sind!
    this.oldNodes = JSON.parse(JSON.stringify(oldNodes));
    this.newNodes = JSON.parse(JSON.stringify(newNodes));
  }

  public execute(): void {
    const route = this.playMngr.getEntity<RouteEntity>(this.routeId);
    if (!route) return;

    // Wir rufen nicht mehr updatePoints auf, sondern greifen direkt
    // auf das Property zu und triggern das Neu-Zeichnen
    route.nodes = JSON.parse(JSON.stringify(this.newNodes));

    const canvas = route.getFabricObjects()[0]?.canvas;
    route.applyNodes(this.newNodes, canvas);

    this.canvasMngr.requestRender();
  }

  public undo(): void {
    const route = this.playMngr.getEntity<RouteEntity>(this.routeId);
    if (!route) return;

    route.nodes = JSON.parse(JSON.stringify(this.oldNodes));

    const canvas = route.getFabricObjects()[0]?.canvas;
    route.applyNodes(this.oldNodes, canvas);

    this.canvasMngr.requestRender();
  }
}
