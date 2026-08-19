import { RouteEntity, type RouteConfig } from "@/entities/RouteEntity";
import { SegmentType } from "@/types/interfaces";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  // Eine Basis-Klasse für Fabric-Objekte, die Events simulieren kann
  class MockFabricObject {
    public options: any;
    public left: number;
    public top: number;
    public eventHandlers: Record<string, Function> = {};
    public selectable = true;
    public evented = true;
    public hasControls = true;
    public hasBorders = true;
    public canvas?: any;
    public dirty = false;

    // Für das Klonen von Path-Eigenschaften in updatePathVisuals
    public path = ["M", 0, 0];
    public width = 100;
    public height = 100;
    public pathOffset = { x: 0, y: 0 };

    constructor(options: any = {}) {
      this.options = options;
      this.left = options.left || 0;
      this.top = options.top || 0;
    }

    set = vi.fn(function (this: any, key: any, val: any) {
      if (typeof key === "object") {
        Object.assign(this, key);
      } else {
        this[key] = val;
      }
    });

    setCoords = vi.fn();

    on = vi.fn((event: string, handler: Function) => {
      this.eventHandlers[event] = handler;
    });

    // Hilfsfunktion für den Test, um Events von außen zu triggern
    trigger = (event: string, ...args: any[]) => {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event](...args);
      }
    };
  }

  return {
    MockFabricObject,
    MockFabricPath: class extends MockFabricObject {
      constructor(pathStr: string, options?: any) {
        super(options);
      }
    },
    MockFabricTriangle: class extends MockFabricObject {},

    utils: {
      calculateArrowheadMetrics: vi
        .fn()
        .mockReturnValue({ x: 50, y: 50, angle: 90 }),
      generateSvgPathString: vi.fn().mockReturnValue("M 0 0 L 100 100"),
    },

    // Mocks für die Control Handles
    handles: {
      WaypointHandle: class {
        circle = new MockFabricObject();
        constructor(
          public x: number,
          public y: number,
          public canvas: any,
          public id: string,
        ) {}
        attachBezier = vi.fn();
        show = vi.fn();
        hide = vi.fn();
        destroy = vi.fn();
      },
      StretchHandle: class {
        rect = new MockFabricObject();
        constructor(
          public x: number,
          public y: number,
          public axis: string,
          public canvas: any,
          public id: string,
        ) {}
        show = vi.fn();
        hide = vi.fn();
        destroy = vi.fn();
      },
      BezierHandle: class {
        onMoved?: (x: number, y: number) => void;
        onMoveComplete?: () => void;
        constructor(
          public cpX: number,
          public cpY: number,
          public x: number,
          public y: number,
          public canvas: any,
          public id: string,
        ) {}
        show = vi.fn();
        hide = vi.fn();
        destroy = vi.fn();
      },
    },
  };
});

// Module Mocking
vi.mock("fabric", () => ({
  Path: mocks.MockFabricPath,
  Triangle: mocks.MockFabricTriangle,
}));

vi.mock("@/utils/geometry", () => ({
  calculateArrowheadMetrics: mocks.utils.calculateArrowheadMetrics,
}));

vi.mock("@/utils/PathUtils", () => ({
  generateSvgPathString: mocks.utils.generateSvgPathString,
}));

vi.mock("@/entities/controls/ControlHandle", () => ({
  WaypointHandle: mocks.handles.WaypointHandle,
  StretchHandle: mocks.handles.StretchHandle,
  BezierHandle: mocks.handles.BezierHandle,
}));

describe("RouteEntity", () => {
  let defaultConfig: RouteConfig;
  let mockCanvas: any;

  beforeEach(() => {
    vi.clearAllMocks();

    defaultConfig = {
      id: "route-123",
      playerId: "player-1",
      routeType: "default",
      color: "#ff0000",
      nodes: [
        { x: 0, y: 0, type: SegmentType.STRAIGHT },
        { x: 100, y: 100, type: SegmentType.STRAIGHT },
      ],
    };

    mockCanvas = {
      requestRenderAll: vi.fn(),
    };
  });

  describe("Konstruktor & Initialisierung", () => {
    it("sollte Pfad und Pfeilspitze (ArrowHead) korrekt aufbauen", () => {
      const route = new RouteEntity(defaultConfig);

      expect(mocks.utils.generateSvgPathString).toHaveBeenCalledWith(
        defaultConfig.nodes,
      );
      expect(mocks.utils.calculateArrowheadMetrics).toHaveBeenCalledWith(
        defaultConfig.nodes,
      );

      const fabricObjects = route.getFabricObjects();
      expect(fabricObjects).toHaveLength(2); // Path und Triangle

      const arrowHead = fabricObjects[1] as any;
      expect(arrowHead.options.fill).toBe("#ff0000");
    });

    it("sollte Styles basierend auf dem routeType anpassen (option_1 = gestrichelt)", () => {
      const route = new RouteEntity({
        ...defaultConfig,
        routeType: "option_1",
      });
      const path = route.getFabricObjects()[0] as any;

      expect(path.options.strokeDashArray).toEqual([12, 10]);
    });

    it("sollte Styles basierend auf dem routeType anpassen (option_2 = orange)", () => {
      const route = new RouteEntity({
        ...defaultConfig,
        routeType: "option_2",
      });
      const path = route.getFabricObjects()[0] as any;

      expect(path.options.stroke).toBe("#FFA500");
      expect(route.color).toBe("#FFA500"); // Interne Farbe muss auch Orange sein
    });
  });

  describe("Methoden & Getters", () => {
    it("sollte setSelectable auf Pfad und Arrow anwenden", () => {
      const route = new RouteEntity(defaultConfig);
      const objects = route.getFabricObjects() as any[];
      const path = objects[0];
      const arrow = objects[1];

      route.setSelectable(false);
      expect(path.selectable).toBe(false);
      expect(path.evented).toBe(false);
      // Arrow ist immer false
      expect(arrow.selectable).toBe(false);

      route.setSelectable(true);
      expect(path.selectable).toBe(true);
      expect(path.evented).toBe(true);
      expect(arrow.selectable).toBe(false); // Bleibt false!
    });

    it("sollte translate() anwenden und die Visuals updaten", () => {
      const route = new RouteEntity(defaultConfig);

      // Node mit Curve simulieren, um cpIn/cpOut Verschiebung zu testen
      route.nodes = [
        { x: 10, y: 10, type: SegmentType.STRAIGHT },
        { x: 50, y: 50, type: SegmentType.CURVE, cpInX: 20, cpInY: 20 },
      ];

      route.translate(100, 200);

      // Assert Koordinaten verschoben
      expect(route.nodes[0].x).toBe(110);
      expect(route.nodes[0].y).toBe(210);
      expect(route.nodes[1].x).toBe(150);
      expect(route.nodes[1].y).toBe(250);
      expect(route.nodes[1].cpInX).toBe(120);
      expect(route.nodes[1].cpInY).toBe(220);

      // Assert Path Update
      expect(mocks.utils.generateSvgPathString).toHaveBeenCalled();
    });

    it("sollte applyNodes() (Undo/Redo) verarbeiten", () => {
      const route = new RouteEntity(defaultConfig);
      const initControlsSpy = vi.spyOn(route, "initializeControls");

      const newNodes = [{ x: 999, y: 999, type: SegmentType.STRAIGHT }];

      // Act: Mit Canvas Parameter (sollte Controls neu laden)
      route.applyNodes(newNodes, mockCanvas);

      expect(route.nodes).toEqual(newNodes);
      expect(route.nodes).not.toBe(newNodes); // Deep Copy Check
      expect(initControlsSpy).toHaveBeenCalledWith(mockCanvas);
    });
  });

  describe("Control Handles & Event Logic", () => {
    let route: RouteEntity;

    beforeEach(() => {
      // 3 Nodes: Start -> Gerade (Vertical) -> Kurve
      defaultConfig.nodes = [
        { x: 100, y: 100, type: SegmentType.STRAIGHT }, // index 0 (wird übersprungen in der loop)
        { x: 105, y: 200, type: SegmentType.STRAIGHT }, // Vertical Line (dx < 10) -> StretchHandle
        { x: 200, y: 200, type: SegmentType.CURVE, cpInX: 150, cpInY: 150 }, // Curve -> BezierHandle
      ];
      route = new RouteEntity(defaultConfig);
      route.initializeControls(mockCanvas);
    });

    it("sollte Waypoint, Stretch und Bezier Handles anhand der Nodes korrekt aufbauen", () => {
      const handles = (route as any).handles;

      // Erwartet:
      // Node 1: WaypointHandle + StretchHandle
      // Node 2: WaypointHandle + BezierHandle
      expect(handles).toHaveLength(4);
    });

    it("sollte showControls(), hideControls() und destroyAllHandles() an Handles delegieren", () => {
      const handles = (route as any).handles;
      const spiesShow = handles.map((h: any) => vi.spyOn(h, "show"));
      const spiesHide = handles.map((h: any) => vi.spyOn(h, "hide"));
      const spiesDestroy = handles.map((h: any) => vi.spyOn(h, "destroy"));

      route.showControls();
      spiesShow.forEach((spy: any) => expect(spy).toHaveBeenCalled());

      route.hideControls();
      spiesHide.forEach((spy: any) => expect(spy).toHaveBeenCalled());

      route.destroyAllHandles();
      spiesDestroy.forEach((spy: any) => expect(spy).toHaveBeenCalled());
      expect((route as any).handles).toHaveLength(0);
    });

    describe("Handle Drag & Drop Events", () => {
      let onModifiedSpy: ReturnType<
        typeof vi.fn<(routeId: string, oldNodes: RouteConfig["nodes"], newNodes: RouteConfig["nodes"]) => void>
      >;

      beforeEach(() => {
        onModifiedSpy = vi.fn<
          (routeId: string, oldNodes: RouteConfig["nodes"], newNodes: RouteConfig["nodes"]) => void
        >();
        route.onNodesModified = onModifiedSpy;
      });

      it("sollte onNodesModified triggern, wenn ein Waypoint bewegt wird", () => {
        const waypointHandle = (route as any).handles[0]; // Das ist Node 1 (Index 1) Waypoint
        const fabricCircle = waypointHandle.circle;

        // 1. Mousedown (speichert State)
        fabricCircle.trigger("mousedown");

        // 2. Moving (verändert Koordinaten)
        fabricCircle.left = 500;
        fabricCircle.top = 500;
        fabricCircle.trigger("moving");

        expect(route.nodes[1].x).toBe(500);
        expect(route.nodes[1].y).toBe(500);
        expect(mockCanvas.requestRenderAll).toHaveBeenCalled();

        // 3. Modified (löst Event aus)
        fabricCircle.trigger("modified");

        expect(onModifiedSpy).toHaveBeenCalledTimes(1);
        expect(onModifiedSpy.mock.calls[0][1]).not.toEqual(
          onModifiedSpy.mock.calls[0][2],
        ); // Old vs New
      });

      it("sollte stumm abbrechen (kein onNodesModified), wenn sich die Nodes nicht verändert haben", () => {
        const waypointHandle = (route as any).handles[0];
        const fabricCircle = waypointHandle.circle;

        // Simuliere Klick ohne Bewegung
        fabricCircle.trigger("mousedown");
        fabricCircle.trigger("modified");

        expect(onModifiedSpy).not.toHaveBeenCalled();
      });

      it("sollte Stretch-Logik anwenden (Y-Achse für aktuelle und nachfolgende Nodes verschieben)", () => {
        const stretchHandle = (route as any).handles[1]; // Node 1 StretchHandle
        const fabricRect = stretchHandle.rect;

        // Node 1 StartY = 200, Node 2 StartY = 200
        fabricRect.trigger("mousedown");

        // Rect nach unten ziehen (+50px)
        // StretchHandle liegt immer auf Y + STRETCH_OFFSET_Y (-25), also Start = 175. Neu = 225.
        fabricRect.top = 225;

        fabricRect.trigger("moving");

        // Da dy = +50 ist, müssen Node 1 und Node 2 um 50px auf Y nach unten rutschen
        expect(route.nodes[1].y).toBe(250);
        expect(route.nodes[2].y).toBe(250);

        // Auch der ControlPoint (cpInY: 150) von Node 2 muss rutschen!
        expect(route.nodes[2].cpInY).toBe(200);
      });

      it("sollte Bezier-Events anwenden (onMoved -> onMoveComplete)", () => {
        const bezierHandle = (route as any).handles[3]; // Node 2 BezierHandle

        // Act: Callback vom Handle direkt aufrufen
        bezierHandle.onMoved!(999, 888);

        expect(route.nodes[2].cpInX).toBe(999);
        expect(route.nodes[2].cpInY).toBe(888);
        expect(mockCanvas.requestRenderAll).toHaveBeenCalled();

        bezierHandle.onMoveComplete!();
        expect(onModifiedSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
