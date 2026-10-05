import { SegmentType, type RouteNode } from "../types/domain";

/**
 * Generiert einen SVG Path aus Array von RouteNodes
 */
export function generateSvgPathString(nodes: RouteNode[]): string {
  if (!nodes || nodes.length === 0) return "";

  let pathStr = `M ${nodes[0]?.position.x} ${nodes[0]?.position.y}`;

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];

    if (curr?.type === SegmentType.CURVE) {
      pathStr += ` Q ${curr?.cpIn?.x} ${curr?.cpIn?.y} ${curr?.position.x} ${curr?.position.y}`;
    } else {
      pathStr += ` L ${curr?.position.x} ${curr?.position.y}`;
    }
  }

  return pathStr;
}
