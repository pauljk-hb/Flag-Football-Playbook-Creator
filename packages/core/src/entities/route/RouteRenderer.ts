import * as fabric from "fabric";
import { CANVAS } from "../../constants/constants";
import { SegmentType, type Point2D, type RouteNode } from "../../types/domain";
import { generateSvgPathString } from "../../utils/PathUtils";
import { calculateArrowheadMetrics, clampPoint } from "../../utils/geometry";
import { BaseRenderer } from "../base/BaseRenderer";
import type { RouteModel } from "./RouteModel";
import {
  BezierHandle,
  StretchHandle,
  WaypointHandle,
  type IControlHandle,
} from "./controls/ControlHandle";

export class RouteRenderer extends BaseRenderer<RouteModel> {
  private arrowHead?: any;
  private handles: IControlHandle[] = [];
  private dragStartNodes: RouteNode[] | null = null;

  public render(model: RouteModel): void {
    this.currentModel = model;

    const pathString = generateSvgPathString(model.nodes);

    this.fabricObject = new fabric.Path(
      pathString,
      this.getPathStyleConfig(model),
    );

    this.fabricObject.set({
      entityId: model.id,
      entityType: "ROUTE",
      parentId: model.playerId,
    });

    this.arrowHead = new fabric.Triangle({
      width: 24,
      height: 24,
      fill: this.getPathStyleConfig(model).stroke,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    this.updateArrowPosition();

    this.canvasManager.addFabricObject(this.fabricObject);
    this.canvasManager.addFabricObject(this.arrowHead);
  }

  public syncWithModel(model: RouteModel): void {
    if (!this.fabricObject || !this.arrowHead) return;

    this.currentModel = model;

    // Visuelles Update der Linie und des Pfeils anhand der neuen Model-Daten
    this.updatePathVisuals();

    // Falls die Handles gerade sichtbar sind, müssen sie auch an die neuen Positionen
    if (this.handles.length > 0) {
      this.initializeControls();
      //this.showControls();
    }
  }

  private getPathStyleConfig(model: RouteModel): any {
    let dashArray: number[] | undefined = undefined;
    let renderColor = model.style.color;

    switch (model.routeType) {
      case "option_1":
        dashArray = [12, 10];
        break;
      case "option_2":
        renderColor = "#FFA500";
        break;
      case "default":
        break;
      default:
        break;
    }

    return {
      fill: "transparent",
      stroke: renderColor,
      strokeWidth: 8,
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

  public override getFabricObjects(): fabric.Object[] {
    const objects: fabric.Object[] = [];
    if (this.fabricObject) objects.push(this.fabricObject);
    if (this.arrowHead) objects.push(this.arrowHead);
    return objects;
  }

  public override getControlObjects(): fabric.Object[] {
    return this.handles.flatMap((handle) => handle.getFabricObject());
  }

  public setSelectable(enabled: boolean): void {
    if (this.fabricObject) {
      this.fabricObject.selectable = enabled;
      this.fabricObject.evented = enabled;
    }

    if (this.arrowHead) {
      this.arrowHead.selectable = false;
      this.arrowHead.evented = false;
      this.arrowHead.hasControls = false;
      this.arrowHead.hasBorders = false;
    }
  }

  public initializeControls(): void {
    if (!this.currentModel) return;

    this.destroyAllHandles();
    // Nutzt den CanvasManager um an die fabric.Canvas Instanz zu kommen
    const canvas = this.canvasManager.getRawCanvas();

    const STRETCH_OFFSET_Y = -25;
    const PADDING = 10;
    const nodes = this.currentModel.nodes;

    const controlsMap: { waypoint: WaypointHandle; stretch?: StretchHandle }[] =
      [];

    nodes.forEach((node, index) => {
      if (index === 0) return;

      const waypoint = new WaypointHandle(
        node.position,
        canvas,
        this.currentModel!.id,
      );
      this.handles.push(waypoint);

      const prevNode = nodes[index - 1];
      const isVerticalLine =
        Math.abs(node.position.x - prevNode.position.x) < 10;
      let stretchHandle: StretchHandle | undefined;

      if (isVerticalLine) {
        stretchHandle = new StretchHandle(
          { x: node.position.x, y: node.position.y + STRETCH_OFFSET_Y },
          "Y",
          canvas,
          this.currentModel!.id,
        );
        this.handles.push(stretchHandle);
      }

      controlsMap[index] = { waypoint, stretch: stretchHandle };

      let bezierHandle: BezierHandle | undefined;

      if (node.type === SegmentType.CURVE && node.cpIn) {
        bezierHandle = new BezierHandle(
          node.cpIn,
          node.position,
          canvas,
          this.currentModel!.id,
        );
        this.handles.push(bezierHandle);

        waypoint.attachBezier(bezierHandle);

        bezierHandle.onMoved = (newPosition: Point2D) => {
          if (!this.dragStartNodes) {
            this.dragStartNodes = JSON.parse(JSON.stringify(nodes));
          }

          const clamped = clampPoint(
            newPosition,
            CANVAS.WIDTH,
            CANVAS.HEIGHT,
            PADDING,
          );

          if (nodes[index].cpIn) {
            nodes[index].cpIn!.x = clamped.x;
            nodes[index].cpIn!.y = clamped.y;
          } else {
            nodes[index].cpIn = clamped;
          }

          this.updatePathVisuals();
          canvas.requestRenderAll();
        };

        bezierHandle.onMoveComplete = () => this.fireModifiedEvent();
      }

      // Event für WaypointHandle
      waypoint.circle.on("mousedown", () => {
        this.dragStartNodes = JSON.parse(JSON.stringify(nodes));
      });

      waypoint.circle.on("moving", () => {
        if (!this.dragStartNodes)
          this.dragStartNodes = JSON.parse(JSON.stringify(nodes));

        const clamped = clampPoint(
          { x: waypoint.circle.left ?? 0, y: waypoint.circle.top ?? 0 },
          CANVAS.WIDTH,
          CANVAS.HEIGHT,
          PADDING,
        );

        waypoint.circle.set({
          left: clamped.x,
          top: clamped.y,
        });

        nodes[index].position.x = clamped.x;
        nodes[index].position.y = clamped.y;

        if (stretchHandle) {
          stretchHandle.rect.set({
            left: nodes[index].position.x,
            top: nodes[index].position.y + STRETCH_OFFSET_Y,
          });
          stretchHandle.rect.setCoords();
        }

        this.updatePathVisuals();
        canvas.requestRenderAll();
      });

      waypoint.circle.on("modified", () => this.fireModifiedEvent());

      // Event für StretchHandle
      if (stretchHandle) {
        stretchHandle.rect.on("mousedown", () => {
          this.dragStartNodes = JSON.parse(JSON.stringify(nodes));
        });

        stretchHandle.rect.on("moving", () => {
          if (!this.dragStartNodes)
            this.dragStartNodes = JSON.parse(JSON.stringify(nodes));

          const startNodes = this.dragStartNodes!;
          const startHandleY = startNodes[index].position.y + STRETCH_OFFSET_Y;
          const currentHandleY = stretchHandle!.rect.top ?? 0;
          const dy = currentHandleY - startHandleY;

          for (let i = index; i < nodes.length; i++) {
            nodes[i].position.y = startNodes[i].position.y + dy;

            if (nodes[i].cpIn && startNodes[i].cpIn)
              nodes[i].cpIn!.y = startNodes[i].cpIn!.y + dy;

            if (nodes[i].cpOut && startNodes[i].cpOut)
              nodes[i].cpOut!.y = startNodes[i].cpOut!.y + dy;

            if (controlsMap[i]) {
              controlsMap[i].waypoint.circle.set({ top: nodes[i].position.y });
              controlsMap[i].waypoint.circle.setCoords();

              if (controlsMap[i].stretch && i !== index) {
                controlsMap[i].stretch!.rect.set({
                  top: nodes[i].position.y + STRETCH_OFFSET_Y,
                });
                controlsMap[i].stretch!.rect.setCoords();
              }
            }
          }

          this.updatePathVisuals();
          canvas.requestRenderAll();
        });

        stretchHandle.rect.on("modified", () => this.fireModifiedEvent());
      }
    });
  }

  private fireModifiedEvent(): void {
    if (this.dragStartNodes && this.currentModel) {
      const newNodes = JSON.parse(JSON.stringify(this.currentModel.nodes));

      if (JSON.stringify(this.dragStartNodes) !== JSON.stringify(newNodes)) {
        // EventBus ersetzt den direkten this.onNodesModified Callback
        this.eventBus.emit("route:modified", {
          routeId: this.currentModel.id,
          oldNodes: this.dragStartNodes,
          newNodes: newNodes,
        });
      }
    }
    this.dragStartNodes = null;
  }

  public showControls(): void {
    // Da Handles bei Routes dynamisch gebaut werden müssen, prüfen wir ob sie existieren
    if (this.handles.length === 0) {
      this.initializeControls();
    }
    this.handles.forEach((h) => h.show());
    console.trace(
      `DEBUG: showControls aufgerufen für Player ${this.currentModel?.id}`,
    );
  }

  public hideControls(): void {
    this.handles.forEach((h) => h.hide());
  }

  public destroyAllHandles(): void {
    this.handles.forEach((h) => h.destroy());
    this.handles = [];
  }

  private syncHandlePositions(): void {
    if (!this.currentModel) return;
    const nodes = this.currentModel.nodes;
    let nodeIndex = 1; // Wir starten bei 1, da Node 0 keinen Waypoint hat

    this.handles.forEach((handle) => {
      if (!nodes[nodeIndex]) return;

      if (handle instanceof WaypointHandle) {
        handle.circle.set({
          left: nodes[nodeIndex].position.x,
          top: nodes[nodeIndex].position.y,
        });
        handle.circle.setCoords();
        // Wenn das nächste Handle KEIN StretchHandle/Bezier ist, gehen wir zum nächsten Node
        // (Hier musst du evtl. deine Logik leicht anpassen, je nachdem in welcher
        // Reihenfolge die Handles in this.handles liegen)
      }
      // Analog für StretchHandle und BezierHandle...
    });

    this.canvasManager.getRawCanvas().requestRenderAll();
  }

  private updatePathVisuals(): void {
    if (!this.currentModel || !this.fabricObject) return;

    const newSvgString = generateSvgPathString(this.currentModel.nodes);
    const tempPath = new fabric.Path(newSvgString);

    this.fabricObject.set({
      path: tempPath.path,
      left: tempPath.left,
      top: tempPath.top,
      width: tempPath.width,
      height: tempPath.height,
      pathOffset: tempPath.pathOffset,
    });

    const pathAny = this.fabricObject as any;
    delete pathAny.pathBbox;
    delete pathAny.segmentsInfo;
    delete pathAny._cachedPath;

    this.fabricObject.setCoords();
    this.fabricObject.dirty = true;

    this.updateArrowPosition();
  }

  private updateArrowPosition(): void {
    if (!this.currentModel || !this.arrowHead) return;

    const { position, angle } = calculateArrowheadMetrics(
      this.currentModel.nodes,
    );
    this.arrowHead.set({ left: position.x, top: position.y, angle: angle });
  }

  // Override destroy from BaseRenderer to also clean up arrowHead and handles
  public destroy(): void {
    super.destroy();
    if (this.arrowHead) {
      this.canvasManager.removeFabricObject(this.arrowHead);
      this.arrowHead = undefined;
    }
    this.destroyAllHandles();
  }
}
