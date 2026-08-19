import type { RouteNode } from "@/types/interfaces";
import { SegmentType } from "@/types/interfaces";
import { generateSvgPathString } from "@/utils/PathUtils";
import { describe, expect, it } from "vitest";

describe("generateSvgPathString", () => {
  describe("Edge Cases", () => {
    it("sollte einen leeren String zurückgeben, wenn das Array leer ist", () => {
      expect(generateSvgPathString([])).toBe("");
    });

    it("sollte einen leeren String zurückgeben, wenn null oder undefined übergeben wird", () => {
      expect(generateSvgPathString(null as any)).toBe("");
      expect(generateSvgPathString(undefined as any)).toBe("");
    });
  });

  describe("Happy Path: Generierung von SVG Paths", () => {
    it("sollte nur den initialen Move-Befehl (M) generieren, wenn nur ein Node übergeben wird", () => {
      const nodes: RouteNode[] = [{ x: 10, y: 20 } as RouteNode];

      const result = generateSvgPathString(nodes);

      expect(result).toBe("M 10 20");
    });

    it("sollte Linien (L) für SegmentType.STRAIGHT oder fehlende Typen generieren", () => {
      const nodes: RouteNode[] = [
        { x: 0, y: 0 } as RouteNode,
        { x: 50, y: 50, type: SegmentType.STRAIGHT } as RouteNode,
        { x: 100, y: 100 } as RouteNode,
      ];

      const result = generateSvgPathString(nodes);

      expect(result).toBe("M 0 0 L 50 50 L 100 100");
    });

    it("sollte eine quadratische Bezier-Kurve (Q) generieren, wenn SegmentType.CURVE gesetzt ist", () => {
      const nodes: RouteNode[] = [
        { x: 10, y: 10 } as RouteNode,
        {
          x: 100,
          y: 100,
          type: SegmentType.CURVE,
          cpInX: 50,
          cpInY: 20,
        } as RouteNode,
      ];

      const result = generateSvgPathString(nodes);

      expect(result).toBe("M 10 10 Q 50 20 100 100");
    });

    it("sollte komplexe Routen aus Linien und Kurven korrekt zusammensetzen", () => {
      const nodes: RouteNode[] = [
        { x: 0, y: 0 } as RouteNode, // Start (M)
        { x: 0, y: 20, type: SegmentType.STRAIGHT } as RouteNode, // Linie (L)
        {
          x: 50,
          y: 50,
          type: SegmentType.CURVE,
          cpInX: 10,
          cpInY: 40,
        } as RouteNode, // Kurve (Q)
        { x: 100, y: 50 } as RouteNode, // Fallback auf Linie (L)
      ];

      const result = generateSvgPathString(nodes);

      expect(result).toBe("M 0 0 L 0 20 Q 10 40 50 50 L 100 50");
    });
  });
});
