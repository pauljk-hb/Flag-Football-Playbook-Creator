import { PlaybookEngine } from "@/engine/PlaybookEngine";
import { PlayerEntity } from "@/entities/PlayerEntity";
import { RouteEntity } from "@/entities/RouteEntity";
import { SegmentType } from "@/types/interfaces";
import { FormationBuilder } from "@/utils/FormationBuilder";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    mockHistoryManager: {
      execute: vi.fn(),
      subscribe: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn(),
      canRedo: vi.fn(),
      clear: vi.fn(),
    },
    mockCanvasManager: {
      init: vi.fn(),
      dispose: vi.fn(),
      requestRender: vi.fn(),
      handleResize: vi.fn(),
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      bringObjectToFront: vi.fn(),
      sendToBack: vi.fn(),
      getRawCanvas: vi.fn(),
      generateThumbnail: vi.fn(),
      addFabricObject: vi.fn(),
    },
    mockPlayManager: {
      getAllEntities: vi.fn().mockReturnValue([]),
      getRouteByPlayerAndType: vi.fn(),
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      clearPlay: vi.fn(),
      exportPlay: vi.fn().mockReturnValue({ test: "play-data" }),
      loadPlay: vi.fn(),
    },
    mockSelectionManager: {
      setupSelectionEvents: vi.fn(),
      setInteractionsEnabled: vi.fn(),
      getSelectedObject: vi.fn(),
      hideAllRouteControls: vi.fn(),
    },
    mockFieldManager: {
      drawField: vi.fn(),
      clearField: vi.fn(),
    },
    mockRouteDrawingManager: {
      startDrawing: vi.fn(),
      cancelDrawing: vi.fn(),
      onStateChange: vi.fn(),
      onDrawingComplete: undefined as any,

      _isDrawingActive: false,
      get isDrawingActive() {
        return (globalThis as any).__isDrawingActiveState ?? false;
      },
      set isDrawingActive(value) {
        (globalThis as any).__isDrawingActiveState = value;
      },
    },
    mockNotificationManager: {
      sendFeedback: vi.fn(),
      subscribe: vi.fn(),
    },
  };
});

const {
  mockHistoryManager,
  mockCanvasManager,
  mockPlayManager,
  mockSelectionManager,
  mockFieldManager,
  mockRouteDrawingManager,
  mockNotificationManager,
} = mocks;

// 3. Die Module über eine Funktion, die eine anonyme Klasse instantiiert, mocken
vi.mock("@/history/HistoryManager", () => ({
  HistoryManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockHistoryManager);
  }),
}));

vi.mock("@/managers/CanvasManager", () => ({
  CanvasManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockCanvasManager);
  }),
  CANVAS_SIZE: { width: 800, height: 1200 },
}));

vi.mock("@/managers/PlayManager", () => ({
  PlayManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockPlayManager);
  }),
}));

vi.mock("@/managers/SelectionManager", () => ({
  SelectionManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockSelectionManager);
  }),
}));

vi.mock("@/managers/FieldManager", () => ({
  FieldManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockFieldManager);
  }),
}));

vi.mock("@/managers/RouteDrawingManager", () => ({
  RouteDrawingManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockRouteDrawingManager);
  }),
}));

vi.mock("@/managers/NotificationManager", () => ({
  NotificationManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockNotificationManager);
  }),
}));

vi.mock("@/history/commands/AddPlayerCommand", () => ({
  AddPlayerCommand: vi.fn().mockImplementation(function (
    this: any,
    playerEntity,
  ) {
    this.playerEntity = playerEntity;
  }),
}));
vi.mock("@/history/commands/AddRouteCommand", () => ({
  AddRouteCommand: vi.fn(),
}));
vi.mock("@/history/commands/RemovePlayerCommand", () => ({
  RemovePlayerCommand: vi.fn(),
}));
vi.mock("@/history/commands/RemoveRouteCommand", () => ({
  RemoveRouteCommand: vi.fn(),
}));
vi.mock("@/history/commands/MoveCommands", () => ({
  MovePlayerCommand: vi.fn(),
  MoveRouteCommand: vi.fn(),
}));
vi.mock("@/history/commands/LoadFormationCommand", () => ({
  LoadFormationCommand: vi.fn(),
}));

vi.mock("@/entities/PlayerEntity", () => {
  class MockPlayerEntity {
    id = "player-mock";
    x = 100;
    y = 200;
    color = "#ff0000";
    onMoveComplete?: Function;
    getFabricObjects = vi.fn().mockReturnValue([]);
    constructor(public config: any) {}
  }
  return { PlayerEntity: MockPlayerEntity };
});

vi.mock("@/entities/RouteEntity", () => {
  class MockRouteEntity {
    id = "route-mock";
    destroyAllHandles = vi.fn();
    initializeControls = vi.fn();
    onNodesModified?: Function;
    constructor(public config: any) {}
  }
  return { RouteEntity: MockRouteEntity };
});

vi.mock("@/utils/FormationBuilder", () => ({
  FormationBuilder: { build: vi.fn() },
}));

vi.mock("@/data/presets", () => ({
  FIELD_PRESETS: { STANDARD: { anchor: { x: 400, y: 600 } } },
  FORMATION_PRESETS: { "form-1": {} },
  ROUTE_PRESETS: { "route-1": {} },
}));

vi.mock("@/data/presets/fields", () => ({ DEFAULT_LOS_Y: 800 }));
vi.mock("fabric", () => ({ Line: vi.fn() })); // Mock für Fabric Line

describe("PlaybookEngine", () => {
  let engine: PlaybookEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouteDrawingManager.isDrawingActive = false;
    mockSelectionManager.getSelectedObject.mockReturnValue(undefined);

    engine = new PlaybookEngine();
  });

  describe("Initialisierung & Status", () => {
    it("sollte init() korrekt an Manager delegieren", () => {
      const mockCanvasEl = document.createElement("canvas");
      engine.init(mockCanvasEl);

      expect(mockCanvasManager.init).toHaveBeenCalledWith(mockCanvasEl);
      expect(mockSelectionManager.setupSelectionEvents).toHaveBeenCalled();
      expect(mockHistoryManager.subscribe).toHaveBeenCalled();
      expect(mockFieldManager.drawField).toHaveBeenCalledWith("STANDARD");
      expect(mockCanvasManager.requestRender).toHaveBeenCalled();

      // Callback Registrierung prüfen
      expect(
        (engine as any).routeDrawingManager.onDrawingComplete,
      ).toBeDefined();
    });

    it("sollte dispose() an den CanvasManager weiterleiten", () => {
      engine.dispose();
      expect(mockCanvasManager.dispose).toHaveBeenCalled();
    });

    it("sollte handleResize() weiterleiten", () => {
      engine.handleResize(1024);
      expect(mockCanvasManager.handleResize).toHaveBeenCalledWith(1024);
    });

    it("sollte zwischen editor und viewer Modus wechseln können", () => {
      (engine as any).routeDrawingManager.isDrawingActive = true;

      engine.setMode("viewer");

      expect(engine.getMode()).toBe("viewer");
      expect(mockRouteDrawingManager.cancelDrawing).toHaveBeenCalled();
      expect(mockSelectionManager.setInteractionsEnabled).toHaveBeenCalledWith(
        false,
      );

      engine.setMode("editor");
      expect(engine.getMode()).toBe("editor");
      expect(mockSelectionManager.setInteractionsEnabled).toHaveBeenCalledWith(
        true,
      );
    });
  });

  describe("Player Management", () => {
    it("sollte addPlayer() ausführen und Move-Events registrieren", () => {
      engine.addPlayer({ label: "QB" } as any);

      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(1);

      const commandInstance = (mockHistoryManager.execute as any).mock
        .calls[0][0];

      const mockPlayerInstance = commandInstance.playerEntity;

      expect(mockPlayerInstance).toBeDefined();
      expect(mockPlayerInstance.onMoveComplete).toBeDefined();

      mockPlayerInstance.onMoveComplete("player-mock", 0, 0, 50, 50);
      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe("Route Management", () => {
    it("sollte addRouteFromPreset() ignorieren, wenn kein Spieler ausgewählt ist", () => {
      mockSelectionManager.getSelectedObject.mockReturnValue(null);

      engine.addRouteFromPreset({ waypoints: [] } as any);

      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );
      expect(mockHistoryManager.execute).not.toHaveBeenCalled();
    });

    it("sollte addRouteFromPreset() für einen ausgewählten Spieler ausführen", () => {
      const mockPlayer = new PlayerEntity({} as any);
      mockSelectionManager.getSelectedObject.mockReturnValue(mockPlayer);

      engine.addRouteFromPreset({
        waypoints: [{ dx: 10, dy: -10, type: SegmentType.STRAIGHT }],
      } as any);

      // AddRouteCommand sollte getriggert werden
      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(1);
      expect(mockCanvasManager.bringObjectToFront).toHaveBeenCalledWith(
        mockPlayer,
      );
    });

    it("sollte startDrawingRoute() und stopDrawingRoute() delegieren", () => {
      const mockPlayer = new PlayerEntity({} as any);
      mockSelectionManager.getSelectedObject.mockReturnValue(mockPlayer);

      engine.startDrawingRoute("option_1");
      expect(mockRouteDrawingManager.startDrawing).toHaveBeenCalledWith(
        mockPlayer,
        "option_1",
      );

      engine.stopDrawingRoute();
      expect(mockRouteDrawingManager.cancelDrawing).toHaveBeenCalled();
    });
  });

  describe("Löschen (Delete Object)", () => {
    it("sollte eine Warnung ausgeben, wenn nichts ausgewählt ist", () => {
      engine.deleteSelectedObject();
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Es ist kein Spieler oder Route ausgewählt!",
      );
    });

    it("sollte eine Route löschen, wenn sie ausgewählt ist", () => {
      const mockRoute = new RouteEntity({} as any);
      Object.setPrototypeOf(mockRoute, RouteEntity.prototype); // Wichtig für instanceof
      mockSelectionManager.getSelectedObject.mockReturnValue(mockRoute);

      engine.deleteSelectedObject();
      expect(mockHistoryManager.execute).toHaveBeenCalled(); // RemoveRouteCommand
    });

    it("sollte einen Spieler löschen, wenn er ausgewählt ist", () => {
      const mockPlayer = new PlayerEntity({} as any);
      Object.setPrototypeOf(mockPlayer, PlayerEntity.prototype); // Wichtig für instanceof
      mockSelectionManager.getSelectedObject.mockReturnValue(mockPlayer);

      engine.deleteSelectedObject();
      expect(mockHistoryManager.execute).toHaveBeenCalled(); // RemovePlayerCommand
    });
  });

  describe("Formationen und Plays (Load/Export)", () => {
    it("sollte loadFormation() mit Default-Anchor-Werten und PlayerStyles ausführen", () => {
      // 1. Dummy PlayerStyles
      const mockPlayerStyles = {
        qb: { color: "#ff0000", shape: "circle" },
      } as any;

      // 2. Dummy Spawn Data vom FormationBuilder
      (FormationBuilder.build as any).mockReturnValue([
        { presetId: "qb", x: 400, y: 600 },
      ]);

      // Act: Aufruf ohne customX/customY -> Standard-Anchor (400, 600 aus FIELD_PRESETS["STANDARD"])
      engine.loadFormation("some-formation", mockPlayerStyles);

      // Assert: FormationBuilder.build mit den 5 Parametern aufgerufen
      expect(FormationBuilder.build).toHaveBeenCalledWith(
        "some-formation",
        mockPlayerStyles,
        400, // originX aus Preset Anchor
        600, // originY aus Preset Anchor
        (engine as any).notificationManager,
      );

      // Assert: Command im HistoryManager ausgeführt
      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(1);
    });

    it("sollte loadFormation() mit Custom-Koordinaten (customX, customY) ausführen", () => {
      const mockPlayerStyles = {} as any;
      (FormationBuilder.build as any).mockReturnValue([
        { presetId: "wr", x: 150, y: 250 },
      ]);

      // Act: Mit benutzerdefinierten Koordinaten
      engine.loadFormation("some-formation", mockPlayerStyles, 150, 250);

      expect(FormationBuilder.build).toHaveBeenCalledWith(
        "some-formation",
        mockPlayerStyles,
        150,
        250,
        (engine as any).notificationManager,
      );
      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(1);
    });

    it("sollte stumm abbrechen, wenn FormationBuilder keine Spawn-Daten liefert (spawnData leer)", () => {
      // Setup: Keine Spawn-Daten gefunden / Fehler beim Build
      (FormationBuilder.build as any).mockReturnValue([]);

      // Act
      engine.loadFormation("invalid-formation", {});

      // Assert: Kein Command darf ausgeführt werden
      expect(FormationBuilder.build).toHaveBeenCalled();
      expect(mockHistoryManager.execute).not.toHaveBeenCalled();
    });

    it("sollte loadPlay() ausführen, Callbacks registrieren und Erfolgsmeldung senden", () => {
      // 1. Dummy-Daten für den JSON-String
      const dummyData = {
        fieldPresetId: "CUSTOM",
        players: [{ id: "p1", x: 0, y: 0 }],
        routes: [{ id: "r1", playerId: "p1", nodes: [] }],
      };

      // 2. Dummy-Entitäten, die der gemockte PlayManager zurückgeben soll
      const dummyPlayer = { id: "p1", onMoveComplete: undefined as any };
      const dummyRoute = { id: "r1", onNodesModified: undefined as any };

      // 3. Mock für loadPlay anpassen (destructuring { players, routes } simulieren)
      // Falls du oben "mocks.mockPlayManager" nutzt, ergänze hier das "mocks."
      mockPlayManager.loadPlay.mockReturnValue({
        players: [dummyPlayer],
        routes: [dummyRoute],
      });

      // Act
      engine.loadPlay(JSON.stringify(dummyData));

      // Assert: Wurden die grundlegenden Manager-Calls getätigt?
      expect(mockHistoryManager.clear).toHaveBeenCalledTimes(1);
      expect(mockPlayManager.loadPlay).toHaveBeenCalledWith(dummyData);

      // Assert: Wurden die Events (Closures) an die Entities gebunden?
      expect(dummyPlayer.onMoveComplete).toBeDefined();
      expect(dummyRoute.onNodesModified).toBeDefined();

      // Assert (Deep Dive): Triggern die Callbacks wirklich die Commands im HistoryManager?
      dummyPlayer.onMoveComplete("p1", 0, 0, 50, 50);
      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(1); // MovePlayerCommand ausgeführt

      dummyRoute.onNodesModified("r1", [], [{ x: 10, y: 10 } as any]);
      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(2); // MoveRouteCommand ausgeführt

      // Assert: Erfolgsmeldung gesendet?
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "success",
        "Spielzug erfolgreich geladen!",
      );
    });

    it("sollte exportPlay() als String zurückgeben", () => {
      const result = engine.exportPlay();
      expect(result).toBe(JSON.stringify({ test: "play-data" })); // Aus dem PlayManager Mock
    });
  });

  describe("Export & Thumbnails", () => {
    it("sollte generateThumbnail() an CanvasManager weitergeben", () => {
      mockCanvasManager.generateThumbnail.mockReturnValue("base64-image");

      const result = engine.generateThumbnail();

      expect(mockSelectionManager.hideAllRouteControls).toHaveBeenCalled();
      expect(result).toBe("base64-image");
    });

    it("sollte exportFormationThumbnail() erfolgreich verarbeiten", () => {
      const mockObj = { visible: true };
      const mockRawCanvas = {
        getObjects: vi.fn().mockReturnValue([mockObj]),
        discardActiveObject: vi.fn(),
        renderAll: vi.fn(),
        width: 800,
        toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mocked"),
      };
      mockCanvasManager.getRawCanvas.mockReturnValue(mockRawCanvas);

      // Simuliere, dass ein PlayerEntity im PlayManager existiert
      const mockPlayer = new PlayerEntity({} as any);
      Object.setPrototypeOf(mockPlayer, PlayerEntity.prototype);
      mockPlayer.getFabricObjects = vi
        .fn()
        .mockReturnValue([{ visible: false }]);
      mockPlayManager.getAllEntities.mockReturnValue([mockPlayer]);

      // Act
      const result = engine.exportFormationThumbnail();

      // Assert
      expect(mockFieldManager.clearField).toHaveBeenCalled();
      expect(mockObj.visible).toBe(false); // Alles wurde ausgeblendet
      expect(mockCanvasManager.addFabricObject).toHaveBeenCalled(); // Line hinzugefügt
      expect(mockRawCanvas.toDataURL).toHaveBeenCalled();
      expect(result).toBe("data:image/png;base64,mocked");
    });
  });

  describe("Einfache Delegation-Methoden", () => {
    it("sollte History-Methoden korrekt delegieren", () => {
      engine.undo();
      expect(mockHistoryManager.undo).toHaveBeenCalled();
      engine.redo();
      expect(mockHistoryManager.redo).toHaveBeenCalled();

      mockHistoryManager.canUndo.mockReturnValue(true);
      expect(engine.canUndo()).toBe(true);

      mockHistoryManager.canRedo.mockReturnValue(false);
      expect(engine.canRedo()).toBe(false);
    });

    it("sollte subscribe-Methoden registrieren", () => {
      const dummyCb = () => {};

      engine.subscribeToHistoryChanges(dummyCb);
      expect(mockHistoryManager.subscribe).toHaveBeenCalledWith(dummyCb);

      engine.onNotification(dummyCb);
      expect(mockNotificationManager.subscribe).toHaveBeenCalledWith(dummyCb);

      engine.subscribeToDrawingMode(dummyCb);
      expect(mockRouteDrawingManager.onStateChange).toHaveBeenCalledWith(
        dummyCb,
      );
    });

    it("sollte Getter für System-Daten liefern", () => {
      expect(engine.getAllSystemRoutes()).toEqual(["route-1"]);
      expect(engine.getAllSystemFormations()).toEqual(["form-1"]);
      expect(engine.getAllSystemFields()).toEqual(["STANDARD"]);
    });
  });
});
