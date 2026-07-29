import { SegmentType, type RouteNode } from "../types/interfaces";

export function generateSvgPathString(nodes: RouteNode[]): string {
  if (!nodes || nodes.length === 0) return "";

  let pathStr = `M ${nodes[0].x} ${nodes[0].y}`;

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];

    if (
      curr.type === SegmentType.CURVE &&
      prev.controlPointOut &&
      curr.controlPointIn
    ) {
      pathStr += ` C ${prev.controlPointOut.x} ${prev.controlPointOut.y}, ${curr.controlPointIn.x} ${curr.controlPointIn.y}, ${curr.x} ${curr.y}`;
    } else {
      pathStr += ` L ${curr.x} ${curr.y}`;
    }
  }

  return pathStr;
}
