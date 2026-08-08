import * as fabric from "fabric";
import { BaseEntity } from "./BaseEntity";
import { calculateArrowheadMetrics } from "../utils/geometry";
import { generateSvgPathString } from "../utils/PathUtils";
import type { RouteNode } from "../types/interfaces";
import { SegmentType } from "../types/interfaces";
import {
  BezierHandle,
  StretchHandle,
  WaypointHandle,
  type IControlHandle,
} from "./controls/ControlHandle";

export interface RouteConfig {
  id?: string;
  playerId: string; // Foreign Key zum Spieler!
  routeType: string; // 'main', 'option_1' etc.
  nodes: RouteNode[];
  color: string;
}

export class RouteEntity extends BaseEntity {
  public playerId: string;
  public routeType: string;
  public nodes: RouteNode[];
  public color: string;

  private fabricPath: fabric.Path;
  private arrowHead: fabric.Triangle;

  private handles: IControlHandle[] = [];

  public onNodesModified?: (
    routeId: string,
    oldNodes: RouteNode[],
    newNodes: RouteNode[],
  ) => void;

  private dragStartNodes: RouteNode[] | null = null;

  constructor(config: RouteConfig) {
    super(config.id);
    this.playerId = config.playerId;
    this.routeType = config.routeType;
    this.nodes = config.nodes;
    this.color = config.color;

    // 1. Pfad-Geometrie aus Nodes berechnen
    const pathString = generateSvgPathString(this.nodes);

    this.fabricPath = new fabric.Path(pathString, this.getPathStyleConfig());

    this.arrowHead = new fabric.Triangle({
      width: 14,
      height: 14,
      fill: this.color,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    this.fabricPath.set("id" as any, this.id);

    this.updateArrowPosition();
  }

  /**
   * Gibt das Konfigurationsobjekt für Fabric.js zurück.
   */
  private getPathStyleConfig(): any {
    let dashArray: number[] | undefined = undefined;

    // Styling-Logik (Akzeptiert 'option_1', 'option1', etc.)
    if (this.routeType.includes("option_1") || this.routeType === "option1") {
      dashArray = [12, 10];
    } else if (
      this.routeType.includes("option_2") ||
      this.routeType === "option2"
    ) {
      this.color = "#FFA500";
    }
    return {
      fill: "transparent",
      stroke: this.color,
      strokeWidth: 4,
      strokeLineCap: "round",
      strokeLineJoin: "round",
      strokeDashArray: dashArray,
      objectCaching: false,
      hasControls: false,
      hasBorders: false,
      perPixelTargetFind: true,
      targetFindTolerance: 15,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: "pointer",
      selectable: true,
      evented: true,
    };
  }

  /**
   * Zwingend von BaseEntity gefordert:
   * Gibt alle Fabric-Objekte zurück, die der CanvasManager zeichnen muss.
   */
  public getFabricObjects(): fabric.Object[] {
    return [this.fabricPath, this.arrowHead];
  }

  /**
   * Wird aufgerufen (z.B. vom SelectionManager oder beim AddRouteCommand),
   * um die Editier-Punkte auf das Canvas zu legen.
   */
  public initializeControls(canvas: fabric.Canvas): void {
    this.destroyAllHandles();

    const STRETCH_OFFSET_Y = -25; // Abstand des gelben Vierecks unter dem weißen Punkt

    // Array (aufgebaut nach Index), um Griffe beim Multi-Node-Stretch synchron mitzuziehen
    const controlsMap: { waypoint: WaypointHandle; stretch?: StretchHandle }[] =
      [];

    this.nodes.forEach((node, index) => {
      if (index === 0) return; // Der Spieler/Startpunkt bekommt keine Route-Handles

      // 1. Standard Waypoint-Handle (weißer Kreis) erstellen
      const waypoint = new WaypointHandle(node.x, node.y, canvas, this.id);
      this.handles.push(waypoint);

      // 2. PRÜFUNG: Ist die Linie zu diesem Punkt vertikal?
      // Wir vergleichen die X-Achse mit dem vorherigen Punkt (Toleranz: 10 Pixel)
      const prevNode = this.nodes[index - 1];
      const isVerticalLine = Math.abs(node.x - prevNode.x) < 10;

      let stretchHandle: StretchHandle | undefined;

      // Nur wenn die Linie vertikal verläuft, fügen wir das Stretch-Handle hinzu!
      if (isVerticalLine) {
        stretchHandle = new StretchHandle(
          node.x,
          node.y + STRETCH_OFFSET_Y,
          "Y",
          canvas,
          this.id,
        );
        this.handles.push(stretchHandle);
      }

      // In der Map speichern, damit wir später darauf zugreifen können
      controlsMap[index] = { waypoint, stretch: stretchHandle };

      // ==========================================
      // NEU: BEZIER HANDLE FÜR KURVEN (HIER EINFÜGEN!)
      // ==========================================
      let bezierHandle: BezierHandle | undefined;

      if (
        node.type === SegmentType.CURVE &&
        node.cpInX !== undefined &&
        node.cpInY !== undefined
      ) {
        bezierHandle = new BezierHandle(
          node.cpInX,
          node.cpInY,
          node.x,
          node.y,
          canvas,
          this.id,
        );
        this.handles.push(bezierHandle);

        // Verbindet die gestrichelte Linie mit dem weißen Punkt
        waypoint.attachBezier(bezierHandle);

        // Wenn der blaue Kontrollpunkt gezogen wird:
        bezierHandle.onMoved = (newX, newY) => {
          if (!this.dragStartNodes) {
            this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));
          }

          this.nodes[index].cpInX = newX;
          this.nodes[index].cpInY = newY;

          this.updatePathVisuals();
          this.updateArrowPosition();
          canvas.requestRenderAll();
        };

        // Wenn der Nutzer die Maus loslässt (Undo/Redo Command feuern)
        bezierHandle.onMoveComplete = () => this.fireModifiedEvent();
      }

      // ==========================================
      // EVENTS FÜR DEN WAYPOINT (Normales Bewegen)
      // ==========================================
      waypoint.circle.on("mousedown", () => {
        this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));
      });

      waypoint.circle.on("moving", () => {
        if (!this.dragStartNodes)
          this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));

        this.nodes[index].x = waypoint.circle.left ?? 0;
        this.nodes[index].y = waypoint.circle.top ?? 0;

        // Wenn dieser Punkt ein Stretch-Handle hat, ziehe es synchron mit!
        if (stretchHandle) {
          stretchHandle.rect.set({
            left: this.nodes[index].x,
            top: this.nodes[index].y + STRETCH_OFFSET_Y,
          });
          stretchHandle.rect.setCoords();
        }

        this.updatePathVisuals();
        this.updateArrowPosition();
        canvas.requestRenderAll();
      });

      waypoint.circle.on("modified", () => this.fireModifiedEvent());

      // ==========================================
      // EVENTS FÜR DAS STRETCH-HANDLE (Nur Y-Achse)
      // ==========================================
      if (stretchHandle) {
        stretchHandle.rect.on("mousedown", () => {
          this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));
        });

        stretchHandle.rect.on("moving", () => {
          if (!this.dragStartNodes)
            this.dragStartNodes = JSON.parse(JSON.stringify(this.nodes));

          // Berechnung der vertikalen Verschiebung (dy)
          const startHandleY = this.dragStartNodes[index].y + STRETCH_OFFSET_Y;
          const currentHandleY = stretchHandle!.rect.top ?? 0;
          const dy = currentHandleY - startHandleY;

          // Stretch-Loop: Verschiebt diesen Node und ALLE FOLGENDEN auf der Y-Achse
          for (let i = index; i < this.nodes.length; i++) {
            this.nodes[i].y = this.dragStartNodes[i].y + dy;

            // Kurven-Kontrollpunkte synchronisieren (falls vorhanden)
            if (this.nodes[i].cpInY !== undefined)
              this.nodes[i].cpInY = this.dragStartNodes[i].cpInY! + dy;
            if (this.nodes[i].cpOutY !== undefined)
              this.nodes[i].cpOutY = this.dragStartNodes[i].cpOutY! + dy;

            // Visuelles Update der anderen Handles, damit sie live mit der Linie mitlaufen
            if (controlsMap[i]) {
              controlsMap[i].waypoint.circle.set({ top: this.nodes[i].y });
              controlsMap[i].waypoint.circle.setCoords();

              if (controlsMap[i].stretch && i !== index) {
                controlsMap[i].stretch!.rect.set({
                  top: this.nodes[i].y + STRETCH_OFFSET_Y,
                });
                controlsMap[i].stretch!.rect.setCoords();
              }
            }
          }

          this.updatePathVisuals();
          this.updateArrowPosition();
          canvas.requestRenderAll();
        });

        stretchHandle.rect.on("modified", () => this.fireModifiedEvent());
      }
    });
  }

  /**
   * Hilfsfunktion, um Code-Duplizierung beim Speichern der Undo/Redo Historie zu vermeiden.
   */
  private fireModifiedEvent(): void {
    if (this.dragStartNodes && this.onNodesModified) {
      const newNodes = JSON.parse(JSON.stringify(this.nodes));

      // Nur Command an die Engine schicken, wenn sich die Koordinaten wirklich geändert haben
      if (JSON.stringify(this.dragStartNodes) !== JSON.stringify(newNodes)) {
        this.onNodesModified(this.id, this.dragStartNodes, newNodes);
      }
    }
    this.dragStartNodes = null;
  }

  /**
   * Macht die Handles sichtbar (Aufruf durch SelectionManager)
   */
  public showControls(): void {
    this.handles.forEach((h) => h.show());
  }

  /**
   * Versteckt die Handles (Aufruf durch SelectionManager)
   */
  public hideControls(): void {
    this.handles.forEach((h) => h.hide());
  }

  /**
   * Muss gerufen werden, bevor die Route gelöscht wird (Verhindert Memory Leaks)
   */
  public destroyAllHandles(): void {
    this.handles.forEach((h) => h.destroy());
    this.handles = [];
  }

  /**
   * Wird aufgerufen, wenn ein Handle bewegt wird.
   */
  private updatePathVisuals(): void {
    const newSvgString = generateSvgPathString(this.nodes);
    const tempPath = new fabric.Path(newSvgString);

    this.fabricPath.set({
      path: tempPath.path,
      left: tempPath.left,
      top: tempPath.top,
      width: tempPath.width,
      height: tempPath.height,
      pathOffset: tempPath.pathOffset,
    });

    const pathAny = this.fabricPath as any;
    delete pathAny.pathBbox;
    delete pathAny.segmentsInfo;
    delete pathAny._cachedPath;

    this.fabricPath.setCoords();
    this.fabricPath.dirty = true;

    this.updateArrowPosition();
  }

  /**
   * Wird aufgerufen (z.B. vom MovePlayerCommand), wenn der Spieler läuft.
   * Die Route muss sich synchron mitverschieben.
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

    // 2. Den Pfad neu zeichnen
    this.updatePathVisuals();

    // 3. ACHTUNG: Die Handles liegen absolut auf dem Canvas.
    // Wenn sie aktuell existieren, müssen sie zerstört und neu gebaut werden
    // (oder man gibt jedem Handle eine translate() Methode, das wäre performanter).
    // Fürs Erste (da sie meist beim Bewegen des Spielers unsichtbar sind):
    if (this.handles.length > 0 && this.handles[0].circle?.canvas) {
      this.initializeControls(this.handles[0].circle.canvas);
    }
  }

  /**
   * Wird vom Undo/Redo-System aufgerufen, um einen alten/neuen Zustand herzustellen.
   */
  public applyNodes(newNodes: RouteNode[], canvas?: fabric.Canvas): void {
    this.nodes = JSON.parse(JSON.stringify(newNodes));

    this.updatePathVisuals();

    if (canvas) {
      this.initializeControls(canvas);
      this.showControls();
    }
  }

  private updateArrowPosition(): void {
    const { x, y, angle } = calculateArrowheadMetrics(this.nodes);
    this.arrowHead.set({ left: x, top: y, angle: angle });
  }
}
