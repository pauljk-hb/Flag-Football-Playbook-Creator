import * as fabric from "fabric";
import { CANVAS } from "../../constants/constants";
import { SegmentType, type RouteNode } from "../../types/domain";
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

interface HandleGroup {
  waypoint: WaypointHandle;
  stretch?: StretchHandle;
  bezier?: BezierHandle;
}

export class RouteRenderer extends BaseRenderer<RouteModel> {
  private arrowHead?: any;
  private handles: IControlHandle[] = [];
  private dragStartNodes: RouteNode[] | null = null;
  private handleMap: Map<number, HandleGroup> = new Map();
  private areControlsVisible: boolean = false;

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

    this.updatePathVisuals();

    if (this.areControlsVisible) {
      this.syncHandles();
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

  private syncHandles(): void {
    if (!this.currentModel) return;
    const canvas = this.canvasManager.getRawCanvas();
    const STRETCH_OFFSET_Y = -25;
    const nodes = this.currentModel.nodes;

    const activeIndices = new Set<number>();

    nodes.forEach((node, index) => {
      if (index === 0) return;
      activeIndices.add(index);

      const isVerticalLine =
        index > 0 &&
        Math.abs(node.position.x - nodes[index - 1].position.x) < 10;
      let group = this.handleMap.get(index);

      // Knoten ist neu
      if (!group) {
        group = this.buildHandleGroup(index, node, canvas, isVerticalLine);
        this.handleMap.set(index, group);

        if (this.areControlsVisible) {
          group.waypoint.show();
          group.stretch?.show();
          group.bezier?.show();
        }
      }
      // Knoten existiert
      else {
        group.waypoint.updatePosition(node.position);

        // Stretch-Handle Logik
        if (isVerticalLine && !group.stretch) {
          group.stretch = this.createStretchHandle(index, node, canvas);
          if (this.areControlsVisible) group.stretch.show();
        } else if (!isVerticalLine && group.stretch) {
          canvas.remove(...group.stretch.getFabricObject());
          group.stretch.destroy();
          group.stretch = undefined;
        } else if (isVerticalLine && group.stretch) {
          group.stretch.updatePosition({
            x: node.position.x,
            y: node.position.y + STRETCH_OFFSET_Y,
          });
        }

        // Bezier Logik
        if (group.bezier && node.cpIn) {
          group.bezier.updatePosition(node.cpIn, node.position);
        }
      }
    });

    // Aufräumen von gelöschten Knoten
    for (const [index, group] of this.handleMap.entries()) {
      if (!activeIndices.has(index)) {
        this.destroyHandleGroup(group, canvas);
        this.handleMap.delete(index);
      }
    }

    canvas.requestRenderAll();
  }

  private buildHandleGroup(
    index: number,
    node: RouteNode,
    canvas: fabric.Canvas,
    isVertical: boolean,
  ): HandleGroup {
    const waypoint = new WaypointHandle(
      node.position,
      canvas,
      this.currentModel!.id,
    );
    const PADDING = 10;

    waypoint.circle.on("mousedown", () => {
      this.dragStartNodes = JSON.parse(
        JSON.stringify(this.currentModel!.nodes),
      );
    });

    waypoint.circle.on("moving", () => {
      if (!this.dragStartNodes)
        this.dragStartNodes = JSON.parse(
          JSON.stringify(this.currentModel!.nodes),
        );

      const clamped = clampPoint(
        { x: waypoint.circle.left ?? 0, y: waypoint.circle.top ?? 0 },
        CANVAS.WIDTH,
        CANVAS.HEIGHT,
        PADDING,
      );

      this.currentModel!.nodes[index].position.x = clamped.x;
      this.currentModel!.nodes[index].position.y = clamped.y;

      this.updatePathVisuals();
      this.syncHandles();
    });

    waypoint.circle.on("modified", () => this.fireModifiedEvent());

    let stretch: StretchHandle | undefined;
    if (isVertical) stretch = this.createStretchHandle(index, node, canvas);

    let bezier: BezierHandle | undefined;
    if (node.type === SegmentType.CURVE && node.cpIn) {
      bezier = new BezierHandle(
        node.cpIn,
        node.position,
        canvas,
        this.currentModel!.id,
      );

      bezier.controlPoint.on("mousedown", () => {
        this.dragStartNodes = JSON.parse(
          JSON.stringify(this.currentModel!.nodes),
        );
      });

      bezier.controlPoint.on("moving", () => {
        if (!this.dragStartNodes)
          this.dragStartNodes = JSON.parse(
            JSON.stringify(this.currentModel!.nodes),
          );
        const clamped = clampPoint(
          {
            x: bezier!.controlPoint.left ?? 0,
            y: bezier!.controlPoint.top ?? 0,
          },
          CANVAS.WIDTH,
          CANVAS.HEIGHT,
          PADDING,
        );

        if (this.currentModel!.nodes[index].cpIn) {
          this.currentModel!.nodes[index].cpIn!.x = clamped.x;
          this.currentModel!.nodes[index].cpIn!.y = clamped.y;
        }

        this.updatePathVisuals();
        this.syncHandles();
      });

      bezier.controlPoint.on("modified", () => this.fireModifiedEvent());
    }

    return { waypoint, stretch, bezier };
  }

  private createStretchHandle(
    index: number,
    node: RouteNode,
    canvas: fabric.Canvas,
  ): StretchHandle {
    const STRETCH_OFFSET_Y = -25;
    const stretch = new StretchHandle(
      { x: node.position.x, y: node.position.y + STRETCH_OFFSET_Y },
      "Y",
      canvas,
      this.currentModel!.id,
    );

    stretch.rect.on("mousedown", () => {
      this.dragStartNodes = JSON.parse(
        JSON.stringify(this.currentModel!.nodes),
      );
    });

    stretch.rect.on("moving", () => {
      if (!this.dragStartNodes)
        this.dragStartNodes = JSON.parse(
          JSON.stringify(this.currentModel!.nodes),
        );
      const startNodes = this.dragStartNodes!;
      const dy =
        (stretch.rect.top ?? 0) -
        (startNodes[index].position.y + STRETCH_OFFSET_Y);

      for (let i = index; i < this.currentModel!.nodes.length; i++) {
        this.currentModel!.nodes[i].position.y = startNodes[i].position.y + dy;
        if (this.currentModel!.nodes[i].cpIn && startNodes[i].cpIn) {
          this.currentModel!.nodes[i].cpIn!.y = startNodes[i].cpIn!.y + dy;
        }
        if (this.currentModel!.nodes[i].cpOut && startNodes[i].cpOut) {
          this.currentModel!.nodes[i].cpOut!.y = startNodes[i].cpOut!.y + dy;
        }
      }
      this.updatePathVisuals();
      this.syncHandles();
    });

    stretch.rect.on("modified", () => this.fireModifiedEvent());
    return stretch;
  }

  private fireModifiedEvent(): void {
    if (this.dragStartNodes && this.currentModel) {
      const newNodes = JSON.parse(JSON.stringify(this.currentModel.nodes));

      if (JSON.stringify(this.dragStartNodes) !== JSON.stringify(newNodes)) {
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
    this.areControlsVisible = true;
    this.syncHandles();

    for (const group of this.handleMap.values()) {
      group.waypoint.show();
      if (group.stretch) group.stretch.show();
      if (group.bezier) group.bezier.show();
    }
  }

  public hideControls(): void {
    this.areControlsVisible = false;
    for (const group of this.handleMap.values()) {
      group.waypoint.hide();
      if (group.stretch) group.stretch.hide();
      if (group.bezier) group.bezier.hide();
    }
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

  public destroyAllHandles(): void {
    const canvas = this.canvasManager.getRawCanvas();
    for (const group of this.handleMap.values()) {
      this.destroyHandleGroup(group, canvas);
    }
    this.handleMap.clear();
  }

  private destroyHandleGroup(group: HandleGroup, canvas: fabric.Canvas): void {
    canvas.remove(...group.waypoint.getFabricObject());
    group.waypoint.destroy();

    if (group.stretch) {
      canvas.remove(...group.stretch.getFabricObject());
      group.stretch.destroy();
    }

    if (group.bezier) {
      canvas.remove(...group.bezier.getFabricObject());
      group.bezier.destroy();
    }
  }

  public override destroy(): void {
    this.destroyAllHandles();

    super.destroy();

    this.arrowHead = undefined;
  }

  public override getControlObjects(): fabric.Object[] {
    const objects: fabric.Object[] = [];
    for (const group of this.handleMap.values()) {
      objects.push(...group.waypoint.getFabricObject());
      if (group.stretch) objects.push(...group.stretch.getFabricObject());
      if (group.bezier) objects.push(...group.bezier.getFabricObject());
    }
    return objects;
  }
}
