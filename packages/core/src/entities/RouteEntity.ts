import * as fabric from "fabric";
import { BaseEntity } from "./BaseEntity.js";
import { calculateArrowheadMetrics } from "../math/geometry.js";
import { generateSvgPathString } from "../math/PathUtils.js";
import { MoveRouteCommand } from "../history/commands/MoveCommands.js";
import type { ICommand } from "../types/history.js";
import { type RouteNode, SegmentType } from "../types/interfaces.js"; // Angenommener Pfad für SegmentType
import {
  BezierHandle,
  StretchHandle,
  WaypointHandle,
  type IControlHandle,
} from "./controls/ControlHandle.js";

export interface RouteConfig {
  id?: string;
  nodes: RouteNode[];
  color: string;
}

export class RouteEntity extends BaseEntity {
  public nodes: RouteNode[];
  public fabricObject: fabric.Path;
  public arrowHead: fabric.Triangle;

  public onCommandGenerated?: (command: ICommand) => void;

  // Das Herzstück der neuen Architektur
  private handles: IControlHandle[] = [];
  private dragStartNodes: RouteNode[] | null = null;

  constructor(config: RouteConfig) {
    super(config.id);
    this.nodes = config.nodes;

    const pathString = generateSvgPathString(this.nodes);

    this.fabricObject = new fabric.Path(pathString, {
      fill: "transparent",
      stroke: config.color,
      strokeWidth: 4,
      objectCaching: false,
      hasBorders: false,
      hasControls: false, // WICHTIG: Natives Fabric-Scaling/Rotieren ausstellen
      perPixelTargetFind: true,
      targetFindTolerance: 12,
      lockMovementX: true, // Route wird über Handles bewegt, nicht durch Drag der Linie
      lockMovementY: true,
      hoverCursor: "pointer",
      selectable: true,
    });

    this.arrowHead = new fabric.Triangle({
      width: 14,
      height: 14,
      fill: config.color,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    this.updateArrow();
    // Native Fabric-Events nur noch für Undo/Redo der ganzen Route (falls wir sie doch dragbar machen)
    this.setupEvents();
  }

  // Wird von der Factory (oder BaseEntity beim Hinzufügen) aufgerufen
  public initializeControls(canvas: fabric.Canvas): void {
    this.destroyAllHandles();

    this.nodes.forEach((node) => {
      // 1. Basis-Wegpunkt erstellen
      const waypoint = new WaypointHandle(node.x, node.y, canvas);
      waypoint.onMoved = () => this.updatePathVisuals();
      this.handles.push(waypoint);

      // 2. Bezier-Handles für Kurven
      if (node.type === SegmentType.CURVE) {
        if(node.controlPointIn  node.controlPointOut)
        const bezier = new BezierHandle(node.x, node.y, node.controlPointIn, node.controlPointOut, canvas);
        bezier.onMoved = () => this.updatePathVisuals();
        waypoint.attachBezier(bezier); // Waypoint nimmt das Bezier-Handle "an die Leine"
        this.handles.push(bezier);
      }

      // 3. Stretch-Handle für vertikale/gerade Segmente (optional, je nach Logik)
      if (node.isVerticalStretchable) {
        const stretch = new StretchHandle(node, "Y", canvas);
        stretch.onMoved = () => this.updatePathVisuals();
        this.handles.push(stretch);
      }
    });

    this.hideControls();
  }

  public showControls(): void {
    this.handles.forEach((h) => h.setVisible(true));
  }

  public hideControls(): void {
    this.handles.forEach((h) => h.setVisible(false));
  }

  public destroyAllHandles(): void {
    this.handles.forEach((h) => h.destroy());
    this.handles = [];
  }

  /**
   * Wird getriggert, wenn ein Handle bewegt wird.
   * Generiert den Pfad neu und updated die Pfeilspitze.
   */
  private updatePathVisuals(): void {
    const newSvgString = generateSvgPathString(this.nodes);
    this.fabricObject.set({ path: newSvgString });
    this.fabricObject.setCoords();
    this.updateArrow();
  }

  public updateNodes(newNodes: RouteNode[]): void {
    this.nodes = newNodes;
    this.updatePathVisuals();
    // Hier müssten auch die Handles neu positioniert/initialisiert werden
    // if (canvas) this.initializeControls(canvas);
  }

  public updateArrow(): void {
    const left = this.fabricObject.left ?? 0;
    const top = this.fabricObject.top ?? 0;
    const pathOffset = this.fabricObject.pathOffset ?? { x: 0, y: 0 };

    const { x, y, angle } = calculateArrowheadMetrics(
      this.nodes,
      left,
      top,
      pathOffset,
    );
    this.arrowHead.set({ left: x, top: y, angle: angle });
  }

  private setupEvents(): void {
    // Da lockMovement true ist, feuern diese Events beim reinen Klicken/Ziehen der Linie nicht mehr.
    // Die Historie der Node-Veränderungen muss über die onMoveComplete Callbacks der Handles gelöst werden.
  }
}
