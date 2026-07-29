import type * as fabric from "fabric";
import { RouteEntity } from "../entities/RouteEntity.js";
import type { RoutePreset } from "../types/presets.js";
import { type RouteNode, SegmentType } from "../types/interfaces.js";
import type { SelectionManager } from "../managers/SelectionManager.js"; // Angenommener Pfad
import type { CanvasManager } from "../managers/CanvasManager.js";

export class RouteFactory {
  constructor(
    private canvasManager: CanvasManager,
    private selectionManager: SelectionManager,
  ) {}

  /**
   * Erstellt eine Route aus bereits existierenden Nodes (z.B. aus der DB oder nach freiem Zeichnen)
   */
  public createRoute(nodes: RouteNode[], color: string): RouteEntity {
    const routeEntity = new RouteEntity({
      nodes: nodes,
      color: color,
    });

    // Shapes aufs Canvas legen
    this.canvasManager.add(routeEntity.fabricObject);
    this.canvasManager.add(routeEntity.arrowHead);

    routeEntity.initializeControls(this.canvasManager.getRawCanvas());

    this.bindSelectionEvents(routeEntity);

    return routeEntity;
  }

  /**
   * Baut ein Preset in RouteNodes um und erstellt dann die Route
   */
  /*
  public createFromPreset(
    startX: number,
    startY: number,
    preset: RoutePreset,
    playerColor: string,
  ): RouteEntity {
    const nodes: RouteNode[] = [];

    // Startknoten
    nodes.push({
      x: startX,
      y: startY,
      type: SegmentType.STRAIGHT,
    });

    let currentX = startX;
    let currentY = startY;

    const isRightSide = startX > 400; // Spielfeldmitte (dynamisch machen falls nötig)
    let flipX = false;

    if (
      preset.breakDirection === "inside" ||
      preset.breakDirection === "outside"
    ) {
      if (isRightSide) flipX = true;
    }

    for (const waypoint of preset.waypoints) {
      const actualDx = flipX ? waypoint.dx : -waypoint.dx;
      currentX += actualDx;
      currentY += waypoint.dy;

      // Hier wandeln wir das dumme Preset-Wegpunkt-Format in unsere schlaue Node-Struktur um
      nodes.push({
        x: currentX,
        y: currentY,
        type: waypoint.isCurve ? SegmentType.CURVE : SegmentType.STRAIGHT,
        // Fallbacks für Bezier, falls es eine Kurve ist
        cpInX: waypoint.isCurve ? currentX - actualDx * 0.5 : undefined,
        cpInY: waypoint.isCurve ? currentY - waypoint.dy * 0.5 : undefined,
      });
    }

    return this.createRoute(nodes, playerColor);
  }
    */

  private bindSelectionEvents(routeEntity: RouteEntity): void {
    const path = routeEntity.fabricObject;

    path.on("selected", () => {
      this.selectionManager.setCurrentSelection(routeEntity);
      routeEntity.showControls();
    });

    path.on("deselected", () => {
      if (this.selectionManager.getCurrentSelection() === routeEntity) {
        this.selectionManager.clearSelection();
      }
      routeEntity.hideControls();
    });
  }

  /**
   * Spiegelt die X-Koordinaten einer Route.
   */
  public mirrorRouteNodes(originX: number, nodes: RouteNode[]): RouteNode[] {
    return nodes.map((node) => {
      const dx = node.x - originX;
      return {
        ...node,
        x: originX - dx,
        // Bezier-Punkte müssen ebenfalls gespiegelt werden!
        cpInX:
          node.cpInX !== undefined
            ? originX - (node.cpInX - originX)
            : undefined,
        cpOutX:
          node.cpOutX !== undefined
            ? originX - (node.cpOutX - originX)
            : undefined,
      };
    });
  }
}
