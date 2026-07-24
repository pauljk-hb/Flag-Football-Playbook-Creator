import * as fabric from 'fabric';
import type { RouteEntity } from '../RouteEntity.js';

export function setupRouteControls(entity: RouteEntity): void {
  const poly = entity.fabricObject;

  poly.hasBorders = false;
  poly.hasControls = true; 
  poly.controls = {};

  poly.points.forEach((point, index) => {
    if (index === 0) return;
    poly.controls[`p${index}`] = new fabric.Control({
      positionHandler: (dim, finalMatrix, fabricObject) => {
        const polyObj = fabricObject as fabric.Polyline;
        const pt = polyObj.points[index];
        if (!pt) return new fabric.Point(0, 0);

        const offsetPt = new fabric.Point(
          pt.x - polyObj.pathOffset.x,
          pt.y - polyObj.pathOffset.y
        );
        return fabric.util.transformPoint(
          offsetPt,
          fabric.util.multiplyTransformMatrices(
            polyObj.canvas!.viewportTransform!,
            polyObj.calcTransformMatrix()
          )
        );
      },

      actionHandler: (eventData, transform, x, y) => {
        const polyObj = transform.target as fabric.Polyline;

        const mouseLocal = fabric.util.transformPoint(
          new fabric.Point(x, y),
          fabric.util.invertTransform(polyObj.calcTransformMatrix())
        );

        const newPoints = polyObj.points.map(p => ({ x: p.x, y: p.y }));
        newPoints[index] = {
          x: mouseLocal.x + polyObj.pathOffset.x,
          y: mouseLocal.y + polyObj.pathOffset.y
        };

        entity.updatePoints(newPoints);
        
        return true;
      },

      cursorStyle: 'pointer',
      actionName: 'modifyPolygon',

      render: function (ctx, left, top) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(left, top, 6, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
      },
    });
  });
}