import { PlayerEntity, type PlayerConfig } from "@/entities/PlayerEntity";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const eventHandlers: Record<string, Function> = {};

  class MockFabricObject {
    public selectable = true;
    public evented = true;
    public left: number;
    public top: number;
    public originX: string;
    public originY: string;
    public objects: any[];

    constructor(public options: any = {}) {
      this.left = options.left || 0;
      this.top = options.top || 0;
      this.originX = options.originX || "center";
      this.originY = options.originY || "center";
      this.objects = [];
    }

    set = vi.fn(function (this: any, key: any, val: any) {
      if (typeof key === "object") {
        Object.assign(this, key);
      } else {
        this[key] = val;
      }
    });

    setCoords = vi.fn();
    getScaledWidth = vi.fn().mockReturnValue(32);
    getScaledHeight = vi.fn().mockReturnValue(32);
    item = vi.fn((index: number) => this.objects[index]);

    on = vi.fn((event: string, handler: Function) => {
      eventHandlers[event] = handler;
    });
  }

  return {
    eventHandlers,
    MockFabricGroup: class extends MockFabricObject {
      constructor(objects: any[], options: any) {
        super(options);
        this.objects = objects;
      }
    },
    MockFabricRect: class extends MockFabricObject {},
    MockFabricCircle: class extends MockFabricObject {},
    MockFabricText: class extends MockFabricObject {},

    geometry: {
      snapToCoordinate: vi.fn(),
      clampPositionWithinBounds: vi.fn(),
    },
  };
});

// Fabric mocken
vi.mock("fabric", () => ({
  Group: mocks.MockFabricGroup,
  Rect: mocks.MockFabricRect,
  Circle: mocks.MockFabricCircle,
  Text: mocks.MockFabricText,
}));

vi.mock("@/utils/geometry.js", () => ({
  snapToCoordinate: mocks.geometry.snapToCoordinate,
  clampPositionWithinBounds: mocks.geometry.clampPositionWithinBounds,
}));

vi.mock("@/managers/CanvasManager.js", () => ({
  CANVAS_SIZE: { width: 800, height: 1200 },
}));
vi.mock("@/data/presets/fields.js", () => ({ DEFAULT_LOS_Y: 500 }));

vi.mock("@/entities/BaseEntity.js", () => {
  return {
    BaseEntity: class {
      id: string;
      constructor(id?: string) {
        this.id = id || "mock-id";
      }
    },
  };
});

describe("PlayerEntity", () => {
  let player: PlayerEntity;
  const defaultConfig: PlayerConfig = {
    id: "player-1",
    x: 100,
    y: 200,
    label: "QB",
    color: "#ff0000",
    shape: "circle",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.geometry.snapToCoordinate.mockImplementation((val) => val);
    mocks.geometry.clampPositionWithinBounds.mockImplementation((x, y) => ({
      x,
      y,
    }));

    for (const key in mocks.eventHandlers) {
      delete mocks.eventHandlers[key];
    }

    player = new PlayerEntity(defaultConfig);
  });

  describe("Konstruktor & Initialisierung", () => {
    it('sollte mit einem Kreis (Circle) initialisiert werden, wenn shape = "circle"', () => {
      const p = new PlayerEntity(defaultConfig);

      const bgShape = (p.fabricGroup as any).objects[0];
      expect(bgShape).toBeInstanceOf(mocks.MockFabricCircle);
      expect(p.label).toBe("QB");
      expect(p.color).toBe("#ff0000");
    });

    it('sollte mit einem Rechteck (Rect) initialisiert werden, wenn shape = "square"', () => {
      const p = new PlayerEntity({ ...defaultConfig, shape: "square" });

      const bgShape = (p.fabricGroup as any).objects[0];
      expect(bgShape).toBeInstanceOf(mocks.MockFabricRect);
    });

    it("sollte Events auf der FabricGroup binden", () => {
      expect(player.fabricGroup.on).toHaveBeenCalledWith(
        "mousedown",
        expect.any(Function),
      );
      expect(player.fabricGroup.on).toHaveBeenCalledWith(
        "selected",
        expect.any(Function),
      );
      expect(player.fabricGroup.on).toHaveBeenCalledWith(
        "deselected",
        expect.any(Function),
      );
      expect(player.fabricGroup.on).toHaveBeenCalledWith(
        "moving",
        expect.any(Function),
      );
      expect(player.fabricGroup.on).toHaveBeenCalledWith(
        "modified",
        expect.any(Function),
      );
    });
  });

  describe("Getters & Methoden", () => {
    it("sollte x und y korrekt von der fabricGroup auslesen", () => {
      expect(player.x).toBe(100);
      expect(player.y).toBe(200);
    });

    it("sollte getFabricObjects() als Array mit der fabricGroup zurückgeben", () => {
      const objects = player.getFabricObjects();
      expect(objects).toHaveLength(1);
      expect(objects[0]).toBe(player.fabricGroup);
    });

    it("sollte setSelectable() korrekt auf die fabricGroup anwenden", () => {
      player.setSelectable(false);
      expect(player.fabricGroup.selectable).toBe(false);
      expect(player.fabricGroup.evented).toBe(false);

      player.setSelectable(true);
      expect(player.fabricGroup.selectable).toBe(true);
      expect(player.fabricGroup.evented).toBe(true);
    });

    it("sollte setPosition() aufrufen und die Koordinaten setzen", () => {
      player.setPosition(500, 600);

      expect(player.fabricGroup.set).toHaveBeenCalledWith({
        left: 500,
        top: 600,
      });
      expect(player.fabricGroup.setCoords).toHaveBeenCalledTimes(1);
    });

    it("sollte setColor() anwenden (Hintergrund füllen)", () => {
      const mockBgShape = new mocks.MockFabricCircle();
      (player.fabricGroup.item as any).mockReturnValue(mockBgShape);

      player.setColor("#00ff00");

      expect(player.color).toBe("#00ff00");
      expect(mockBgShape.set).toHaveBeenCalledWith("fill", "#00ff00");
    });

    it("sollte Controls via showControls / hideControls steuern", () => {
      const mockBgShape = new mocks.MockFabricCircle();
      (player.fabricGroup.item as any).mockReturnValue(mockBgShape);

      player.showControls();
      expect(mockBgShape.set).toHaveBeenCalledWith("strokeWidth", 4);
      expect(mockBgShape.set).toHaveBeenCalledWith("stroke", "#FFD700");

      player.hideControls();
      expect(mockBgShape.set).toHaveBeenCalledWith("strokeWidth", 0);
    });
  });

  describe("Fabric Events & Callbacks", () => {
    it('sollte bei "selected" showControls() ausführen', () => {
      const showSpy = vi.spyOn(player, "showControls");
      mocks.eventHandlers["selected"]();
      expect(showSpy).toHaveBeenCalledTimes(1);
    });

    it('sollte bei "deselected" hideControls() ausführen', () => {
      const hideSpy = vi.spyOn(player, "hideControls");
      mocks.eventHandlers["deselected"]();
      expect(hideSpy).toHaveBeenCalledTimes(1);
    });

    it('sollte bei "moving" snapping und clamping anwenden', () => {
      // Setup Dummy-Werte
      (player.fabricGroup as any).left = 150;
      (player.fabricGroup as any).top = 490; // Nah am DEFAULT_LOS_Y (500)

      // Geometry Utils zwingen, bestimmte Werte zurückzuliefern
      mocks.geometry.snapToCoordinate.mockReturnValue(500);
      mocks.geometry.clampPositionWithinBounds.mockReturnValue({
        x: 150,
        y: 500,
      });

      // Act
      mocks.eventHandlers["moving"]();

      // Assert: Wurden die Geometrie-Funktionen korrekt mit den Props aufgerufen?
      expect(mocks.geometry.snapToCoordinate).toHaveBeenCalledWith(
        490,
        500,
        20,
      ); // 500 ist das gemockte DEFAULT_LOS_Y
      expect(mocks.geometry.clampPositionWithinBounds).toHaveBeenCalledWith(
        150,
        500,
        32,
        32,
        800,
        1200,
        "center",
        "center",
      );

      // Assert: Wurde set() auf der fabricGroup mit den clamped Werten aufgerufen?
      expect(player.fabricGroup.set).toHaveBeenCalledWith({
        left: 150,
        top: 500,
      });
    });

    it('sollte onMoveComplete bei "modified" auslösen, wenn sich die Position geändert hat (Happy Path)', () => {
      const onMoveSpy = vi.fn();
      player.onMoveComplete = onMoveSpy;

      // 1. Mousedown simuliert den Start der Bewegung
      (player.fabricGroup as any).left = 100;
      (player.fabricGroup as any).top = 100;
      mocks.eventHandlers["mousedown"]();

      // 2. Neue Position setzen
      (player.fabricGroup as any).left = 200;
      (player.fabricGroup as any).top = 250;

      // 3. Modified Event auslösen
      mocks.eventHandlers["modified"]();

      // Assert
      expect(onMoveSpy).toHaveBeenCalledTimes(1);
      // playerId, startX, startY, endX, endY
      expect(onMoveSpy).toHaveBeenCalledWith(player.id, 100, 100, 200, 250);
    });

    it("sollte onMoveComplete NICHT auslösen, wenn sich die Position nicht geändert hat (Edge Case)", () => {
      const onMoveSpy = vi.fn();
      player.onMoveComplete = onMoveSpy;

      // 1. Startposition
      (player.fabricGroup as any).left = 100;
      (player.fabricGroup as any).top = 100;
      mocks.eventHandlers["mousedown"]();

      // 2. Position bleibt identisch
      (player.fabricGroup as any).left = 100;
      (player.fabricGroup as any).top = 100;

      // 3. Modified Event
      mocks.eventHandlers["modified"]();

      // Assert: Callback darf nicht gefeuert werden
      expect(onMoveSpy).not.toHaveBeenCalled();
    });
  });
});
