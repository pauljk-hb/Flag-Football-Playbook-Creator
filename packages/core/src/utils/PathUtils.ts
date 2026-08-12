import { SegmentType, type RouteNode } from "../types/interfaces";

/**
 * Generiert einen SVG Path aus Array von RouteNodes
 */
export function generateSvgPathString(nodes: RouteNode[]): string {
  if (!nodes || nodes.length === 0) return "";

  let pathStr = `M ${nodes[0]?.x} ${nodes[0]?.y}`;

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];

    if (curr?.type === SegmentType.CURVE) {
      pathStr += ` Q ${curr?.cpInX} ${curr?.cpInY} ${curr?.x} ${curr?.y}`;
    } else {
      pathStr += ` L ${curr?.x} ${curr?.y}`;
    }
  }

  return pathStr;
}
