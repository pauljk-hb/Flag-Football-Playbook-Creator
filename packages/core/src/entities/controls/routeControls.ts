import * as fabric from "fabric";
import type { RouteEntity } from "../RouteEntity.js";
import type { RouteNode } from "../../types/interfaces.js";

const STRETCH_HANDLE_OFFSET_Y = -25;
const VERTICAL_TOLERANCE = 15;

export function setupRouteControls(entity: RouteEntity): void {
  const poly = entity.fabricObject;

  poly.hasBorders = false;
  poly.hasControls = true;
  poly.controls = {};

  poly.points.forEach((point, index) => {
    if (index === 0) return;

    const prevPoint = poly.points[index - 1];
    if (!prevPoint) return;

    const isVertical = Math.abs(point.x - prevPoint.x) < VERTICAL_TOLERANCE;

    if (isVertical) {
      poly.controls[`s${index}`] = createStretchControl(entity, index);
    }

    poly.controls[`p${index}`] = createNormalControl(entity, index, isVertical);
  });
}

export function createStretchControl(
  entity: RouteEntity,
  index: number,
): fabric.Control {
  return new fabric.Control({
    positionHandler: (dim, finalMatrix, fabricObject) => {
      const pathObj = fabricObject as fabric.Path;
      const node = entity.nodes[index];
      if (!node) return new fabric.Point(0, 0);

      const offsetPt = new fabric.Point(
        node.x - (pathObj.pathOffset?.x ?? 0),
        node.y - (pathObj.pathOffset?.y ?? 0) + STRETCH_HANDLE_OFFSET_Y,
      );

      const vpt = pathObj.canvas?.viewportTransform ?? [1, 0, 0, 1, 0, 0];
      return fabric.util.transformPoint(
        offsetPt,
        fabric.util.multiplyTransformMatrices(
          vpt,
          pathObj.calcTransformMatrix(),
        ),
      );
    },

    actionHandler: (eventData, transform, x, y) => {
      const pathObj = transform.target as fabric.Path;
      if (!entity.nodes) return false;

      const mouseLocal = fabric.util.transformPoint(
        new fabric.Point(x, y),
        fabric.util.invertTransform(pathObj.calcTransformMatrix()),
      );

      const newY =
        mouseLocal.y + (pathObj.pathOffset?.y ?? 0) - STRETCH_HANDLE_OFFSET_Y;
      const dy = newY - (entity.nodes[index]?.y ?? 0);

      // Deep copy des Zustands
      const newNodes = JSON.parse(JSON.stringify(entity.nodes)) as RouteNode[];

      // Die Stretch-Schleife: Verschiebt diesen Node und alle folgenden
      for (let i = index; i < newNodes.length; i++) {
        const node = newNodes[i];
        if (node) {
          node.y += dy;
          // Die Kurven-Handles müssen synchron mitwandern
          if (node.controlPointIn) node.controlPointIn.y += dy;
          if (node.controlPointOut) node.controlPointOut.y += dy;
        }
      }

      entity.updateNodes(newNodes);
      return true;
    },

    cursorStyle: "ns-resize",
    actionName: "stretchRoute",
    render: renderStretchControl, // Bleibt gleich
  });
}

function createNormalControl(
  entity: RouteEntity,
  index: number,
  hasStretch: boolean,
): fabric.Control {
  return new fabric.Control({
    positionHandler: (dim, finalMatrix, fabricObject) => {
      const polyObj = fabricObject as fabric.Polyline;
      const pt = polyObj.points?.[index];
      if (!pt) return new fabric.Point(0, 0);

      const offsetPt = new fabric.Point(
        pt.x - (polyObj.pathOffset?.x ?? 0),
        pt.y - (polyObj.pathOffset?.y ?? 0),
      );

      const vpt = polyObj.canvas?.viewportTransform ?? [1, 0, 0, 1, 0, 0];
      return fabric.util.transformPoint(
        offsetPt,
        fabric.util.multiplyTransformMatrices(
          vpt,
          polyObj.calcTransformMatrix(),
        ),
      );
    },

    actionHandler: (eventData, transform, x, y) => {
      const polyObj = transform.target as fabric.Polyline;
      const mouseLocal = fabric.util.transformPoint(
        new fabric.Point(x, y),
        fabric.util.invertTransform(polyObj.calcTransformMatrix()),
      );

      const newPoints = polyObj.points.map((p) => ({ x: p.x, y: p.y }));

      newPoints[index] = {
        x: mouseLocal.x + (polyObj.pathOffset?.x ?? 0),
        y: mouseLocal.y + (polyObj.pathOffset?.y ?? 0),
      };

      entity.updatePoints(newPoints);
      return true;
    },

    cursorStyle: "pointer",
    actionName: "modifyPolygon",
    render: renderNormalControl,
  });
}

function renderStretchControl(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
): void {
  ctx.save();
  ctx.translate(left, top);
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(7, 7);
  ctx.lineTo(-7, 7);
  ctx.closePath();
  ctx.fillStyle = "#f59e0b";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.restore();
}

function renderNormalControl(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(left, top, 6, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#3b82f6";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.restore();
}
