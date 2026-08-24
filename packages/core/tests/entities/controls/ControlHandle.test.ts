import {
  BezierHandle,
  StretchHandle,
  WaypointHandle,
} from "@/entities/controls/ControlHandle";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class MockFabricObject {
    public options: any;
    public left: number;
    public top: number;
    public eventHandlers: Record<string, Function> = {};

    constructor(options: any = {}) {
      this.options = options;
      this.left = options.left || 0;
      this.top = options.top || 0;
    }

    set = vi.fn(function (this: any, key: any, val?: any) {
      if (typeof key === "object") {
        Object.assign(this, key);
      } else {
        this[key] = val;
      }
    });

    on = vi.fn((event: string, handler: Function) => {
      this.eventHandlers[event] = handler;
    });

    // Custom Hilfsfunktion für den Test, um Fabric-Events auszulösen
    trigger = (event: string, ...args: any[]) => {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event](...args);
      }
    };
  }

  return {
    MockFabricObject,
    MockFabricCircle: class extends MockFabricObject {},
    MockFabricLine: class extends MockFabricObject {},
    MockFabricTriangle: class extends MockFabricObject {},
    mockCanvas: {
      add: vi.fn(),
      remove: vi.fn(),
      bringObjectToFront: vi.fn(),
    },
  };
});

// Fabric mocken
vi.mock("fabric", () => ({
  Circle: mocks.MockFabricCircle,
  Line: mocks.MockFabricLine,
  Triangle: mocks.MockFabricTriangle,
}));

describe("ControlHandles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // WaypointHandle
  // -------------------------------------------------------------------
  describe("WaypointHandle", () => {
    let handle: WaypointHandle;

    beforeEach(() => {
      handle = new WaypointHandle(100, 200, mocks.mockCanvas as any, "route-1");
    });

    it("sollte initialisiert werden und Custom-Properties für den SelectionManager setzen", () => {
      expect(mocks.mockCanvas.add).toHaveBeenCalledWith(handle.circle);

      const circleOptions = (handle.circle as any).options;
      expect(circleOptions.fill).toBe("#ffd147");
      expect(circleOptions.visible).toBe(false);

      expect(handle.circle.set).toHaveBeenCalledWith("isRouteHandle", true);
      expect(handle.circle.set).toHaveBeenCalledWith(
        "parentRouteId",
        "route-1",
      );
    });

    it("sollte show(), hide() und destroy() korrekt delegieren", () => {
      handle.show();
      expect(handle.circle.set).toHaveBeenCalledWith({ visible: true });
      expect(mocks.mockCanvas.bringObjectToFront).toHaveBeenCalledWith(
        handle.circle,
      );

      handle.hide();
      expect(handle.circle.set).toHaveBeenCalledWith({ visible: false });

      handle.destroy();
      expect(mocks.mockCanvas.remove).toHaveBeenCalledWith(handle.circle);
    });

    it("sollte onMoved und onMoveComplete Events weiterleiten", () => {
      const onMovedSpy = vi.fn();
      const onMoveCompleteSpy = vi.fn();

      handle.onMoved = onMovedSpy;
      handle.onMoveComplete = onMoveCompleteSpy;

      // Bewege Kreis
      (handle.circle as any).left = 150;
      (handle.circle as any).top = 250;
      (handle.circle as any).trigger("moving");

      expect(onMovedSpy).toHaveBeenCalledWith(150, 250);

      // Event beenden
      (handle.circle as any).trigger("modified");
      expect(onMoveCompleteSpy).toHaveBeenCalledTimes(1);
    });

    it("sollte angebundene Bezier-Handles bei Bewegung mitnehmen", () => {
      // Setup Mock BezierHandle
      const mockBezier = {
        updateAnchorPosition: vi.fn(),
      } as any;

      handle.attachBezier(mockBezier);

      // Bewege Kreis
      (handle.circle as any).left = 300;
      (handle.circle as any).top = 400;
      (handle.circle as any).trigger("moving");

      // Assert
      expect(mockBezier.updateAnchorPosition).toHaveBeenCalledWith(300, 400);
    });

    it("sollte stumm bleiben, wenn Events feuern aber keine Callbacks registriert sind (Edge Case)", () => {
      expect(() => {
        (handle.circle as any).trigger("moving");
        (handle.circle as any).trigger("modified");
      }).not.toThrow();
    });
  });

  // -------------------------------------------------------------------
  // BezierHandle
  // -------------------------------------------------------------------
  describe("BezierHandle", () => {
    let handle: BezierHandle;

    beforeEach(() => {
      // startX, startY, anchorX, anchorY, canvas, routeId
      handle = new BezierHandle(
        50,
        50,
        100,
        100,
        mocks.mockCanvas as any,
        "route-1",
      );
    });

    it("sollte initialisiert werden und TetherLine + ControlPoint zum Canvas hinzufügen", () => {
      expect(mocks.mockCanvas.add).toHaveBeenCalledWith(
        (handle as any).tetherLine,
        handle.controlPoint,
      );

      expect(handle.controlPoint.set).toHaveBeenCalledWith(
        "isRouteHandle",
        true,
      );
      expect(handle.controlPoint.set).toHaveBeenCalledWith(
        "parentRouteId",
        "route-1",
      );
    });

    it("sollte show(), hide() und destroy() auf Line und Point anwenden", () => {
      handle.show();
      expect(handle.controlPoint.set).toHaveBeenCalledWith({ visible: true });
      expect((handle as any).tetherLine.set).toHaveBeenCalledWith({
        visible: true,
      });
      expect(mocks.mockCanvas.bringObjectToFront).toHaveBeenCalledTimes(2);

      handle.hide();
      expect(handle.controlPoint.set).toHaveBeenCalledWith({ visible: false });
      expect((handle as any).tetherLine.set).toHaveBeenCalledWith({
        visible: false,
      });

      handle.destroy();
      expect(mocks.mockCanvas.remove).toHaveBeenCalledWith(
        handle.controlPoint,
        (handle as any).tetherLine,
      );
    });

    it('sollte beim "moving" Event die TetherLine nachziehen und onMoved feuern', () => {
      const onMovedSpy = vi.fn();
      handle.onMoved = onMovedSpy;

      (handle.controlPoint as any).left = 75;
      (handle.controlPoint as any).top = 75;
      (handle.controlPoint as any).trigger("moving");

      expect((handle as any).tetherLine.set).toHaveBeenCalledWith({
        x2: 75,
        y2: 75,
      });
      expect(onMovedSpy).toHaveBeenCalledWith(75, 75);
    });

    it("sollte updateAnchorPosition() die x1/y1 Koordinaten der TetherLine anpassen lassen", () => {
      handle.updateAnchorPosition(200, 200);
      expect((handle as any).tetherLine.set).toHaveBeenCalledWith({
        x1: 200,
        y1: 200,
      });
    });
  });

  // -------------------------------------------------------------------
  // StretchHandle
  // -------------------------------------------------------------------
  describe("StretchHandle", () => {
    it("sollte initialisiert werden und Achsen-spezifische Locks und Cursor anwenden", () => {
      // X-Achse
      const handleX = new StretchHandle(
        10,
        10,
        "X",
        mocks.mockCanvas as any,
        "route-1",
      );
      const optsX = (handleX.rect as any).options;
      expect(optsX.hoverCursor).toBe("ew-resize");
      expect(optsX.lockMovementY).toBe(true);
      expect(optsX.lockMovementX).toBe(false);

      // Y-Achse
      const handleY = new StretchHandle(
        10,
        10,
        "Y",
        mocks.mockCanvas as any,
        "route-2",
      );
      const optsY = (handleY.rect as any).options;
      expect(optsY.hoverCursor).toBe("ns-resize");
      expect(optsY.lockMovementX).toBe(true);
      expect(optsY.lockMovementY).toBe(false);

      expect(mocks.mockCanvas.add).toHaveBeenCalled();
    });

    it("sollte show(), hide() und destroy() korrekt delegieren", () => {
      const handle = new StretchHandle(
        10,
        10,
        "BOTH",
        mocks.mockCanvas as any,
        "route-1",
      );

      handle.show();
      expect(handle.rect.set).toHaveBeenCalledWith({ visible: true });

      handle.hide();
      expect(handle.rect.set).toHaveBeenCalledWith({ visible: false });

      handle.destroy();
      expect(mocks.mockCanvas.remove).toHaveBeenCalledWith(handle.rect);
    });

    it("sollte Events korrekt weiterleiten", () => {
      const handle = new StretchHandle(
        10,
        10,
        "Y",
        mocks.mockCanvas as any,
        "route-1",
      );

      const onMovedSpy = vi.fn();
      const onMoveCompleteSpy = vi.fn();

      handle.onMoved = onMovedSpy;
      handle.onMoveComplete = onMoveCompleteSpy;

      (handle.rect as any).left = 50;
      (handle.rect as any).top = 100;
      (handle.rect as any).trigger("moving");
      expect(onMovedSpy).toHaveBeenCalledWith(50, 100);

      (handle.rect as any).trigger("modified");
      expect(onMoveCompleteSpy).toHaveBeenCalledTimes(1);
    });
  });
});
