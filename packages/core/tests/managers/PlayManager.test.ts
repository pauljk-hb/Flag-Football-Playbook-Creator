import type { BaseEntity } from "@/entities/BaseEntity";
import { PlayerEntity } from "@/entities/PlayerEntity";
import { RouteEntity } from "@/entities/RouteEntity";
import { PlayManager } from "@/managers/PlayManager";
import { SegmentType, type PlayImportData } from "@/types/interfaces";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/entities/PlayerEntity", () => {
  class MockPlayerEntity {
    id: string;
    constructor(public config: any) {
      this.id = config.id || "mock-player-id";
    }
  }
  return { PlayerEntity: MockPlayerEntity };
});

vi.mock("@/entities/RouteEntity", () => {
  class MockRouteEntity {
    id: string;
    destroyAllHandles = vi.fn();
    initializeControls = vi.fn();
    constructor(public config: any) {
      this.id = config.id || "mock-route-id";
    }
  }
  return { RouteEntity: MockRouteEntity };
});

describe("PlayManager", () => {
  let playManager: PlayManager;

  let mockCanvasManager: any;
  let mockHistoryManager: any;
  let mockFieldManager: any;
  let mockNotificationManager: any;

  beforeEach(() => {
    mockCanvasManager = {
      clear: vi.fn(),
      removeEntity: vi.fn(),
      addEntity: vi.fn(),
      bringObjectToFront: vi.fn(),
      requestRender: vi.fn(),
      getRawCanvas: vi.fn().mockReturnValue({ type: "fabric-canvas-mock" }),
    };
    mockHistoryManager = { clear: vi.fn() };
    mockFieldManager = {
      getCurrentPresetId: vi.fn().mockReturnValue("STANDARD"),
      drawField: vi.fn(),
    };
    mockNotificationManager = { sendFeedback: vi.fn() };

    playManager = new PlayManager(
      mockCanvasManager,
      mockHistoryManager,
      mockFieldManager,
      mockNotificationManager,
    );
  });

  describe("Basis CRUD-Operationen", () => {
    it("sollte eine Entität hinzufügen und per ID abrufen können", () => {
      const fakeEntity = { id: "test-1" } as BaseEntity;

      playManager.addEntity(fakeEntity);

      expect(playManager.getAllEntities()).toHaveLength(1);
      expect(playManager.getEntity("test-1")).toBe(fakeEntity);
    });

    it("sollte eine Warnung über den NotificationManager ausgeben, wenn eine ID doppelt hinzugefügt wird", () => {
      const fakeEntity = { id: "duplicate-1" } as BaseEntity;

      playManager.addEntity(fakeEntity);
      playManager.addEntity(fakeEntity);

      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Entity with ID duplicate-1 already exists. Overwriting.",
      );
      expect(playManager.getAllEntities()).toHaveLength(1);
    });

    it("sollte eine Entität entfernen und den State mit clearPlay komplett leeren", () => {
      const entity1 = { id: "e1" } as BaseEntity;
      const entity2 = { id: "e2" } as BaseEntity;

      playManager.addEntity(entity1);
      playManager.addEntity(entity2);

      playManager.removeEntity("e1");
      expect(playManager.getAllEntities()).toHaveLength(1);
      expect(playManager.getEntity("e1")).toBeUndefined();

      playManager.clearPlay();
      expect(playManager.getAllEntities()).toHaveLength(0);
    });
  });

  describe("Filtern von Routen und Spielern", () => {
    const createFakePlayer = (id: string) => {
      const player = { id } as PlayerEntity;
      Object.setPrototypeOf(player, PlayerEntity.prototype);
      return player;
    };

    const createFakeRoute = (
      id: string,
      playerId: string,
      routeType: string,
    ) => {
      const route = { id, playerId, routeType } as RouteEntity;
      Object.setPrototypeOf(route, RouteEntity.prototype);
      return route;
    };

    it("sollte alle Routen eines bestimmten Spielers zurückgeben", () => {
      playManager.addEntity(createFakePlayer("p1"));
      playManager.addEntity(createFakePlayer("p2"));

      playManager.addEntity(createFakeRoute("r1", "p1", "default"));
      playManager.addEntity(createFakeRoute("r2", "p1", "motion"));
      playManager.addEntity(createFakeRoute("r3", "p2", "default"));

      const p1Routes = playManager.getAllRoutesFromPlayer("p1");

      expect(p1Routes).toHaveLength(2);
      expect(p1Routes.map((r) => r.id)).toEqual(["r1", "r2"]);
    });

    it("sollte exakt eine Route nach playerId und routeType finden", () => {
      playManager.addEntity(createFakeRoute("r1", "p1", "default"));
      playManager.addEntity(createFakeRoute("r2", "p1", "motion"));

      const result = playManager.getRouteByPlayerAndType("p1", "motion");

      expect(result).toBeDefined();
      expect(result?.id).toBe("r2");
    });
  });

  describe("Play Daten laden (loadPlay)", () => {
    it("sollte den bestehenden State sauber leeren (Entitäten entfernen, Handles zerstören)", () => {
      const oldPlayer = { id: "p-old" } as PlayerEntity;
      Object.setPrototypeOf(oldPlayer, PlayerEntity.prototype);

      const oldRoute = {
        id: "r-old",
        destroyAllHandles: vi.fn(),
      } as unknown as RouteEntity;
      Object.setPrototypeOf(oldRoute, RouteEntity.prototype);

      playManager.addEntity(oldPlayer);
      playManager.addEntity(oldRoute);

      // Act
      playManager.loadPlay({ fieldPresetId: "TEST", players: [], routes: [] });

      // Assert
      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(oldPlayer);
      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(oldRoute);
      expect(oldRoute.destroyAllHandles).toHaveBeenCalledTimes(1);
      expect(playManager.getAllEntities()).toHaveLength(0);
    });

    it("sollte neue Spieler und Routen aus den Export-Daten aufbauen und zurückgeben", () => {
      const playData: PlayImportData = {
        fieldPresetId: "CUSTOM_FIELD",
        players: [
          {
            id: "p1",
            x: 10,
            y: 10,
            style: {
              label: "QB",
              color: "#f00",
              shape: "circle",
              showLabel: true,
            },
          },
        ],
        routes: [
          {
            id: "r1",
            playerId: "p1",
            routeType: "main",
            color: "#0f0",
            nodes: [{ x: 20, y: 20, type: SegmentType.STRAIGHT }],
          },
        ],
      };

      // Spies setzen, um zu prüfen ob addEntity intern aufgerufen wird
      const addEntitySpy = vi.spyOn(playManager, "addEntity");

      // Act
      const result = playManager.loadPlay(playData);

      // Assert: FieldManager
      expect(mockFieldManager.drawField).toHaveBeenCalledWith("CUSTOM_FIELD");

      // Assert: Resultate
      expect(result.players).toHaveLength(1);
      expect(result.routes).toHaveLength(1);
      expect(result.players[0]).toBeInstanceOf(PlayerEntity);
      expect(result.routes[0]).toBeInstanceOf(RouteEntity);

      // Assert: Manager-Aufrufe für den Player
      expect(addEntitySpy).toHaveBeenCalledWith(result.players[0]);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(
        result.players[0],
      );
      expect(mockCanvasManager.bringObjectToFront).toHaveBeenCalledWith(
        result.players[0],
      );

      // Assert: Manager-Aufrufe für die Route
      expect(addEntitySpy).toHaveBeenCalledWith(result.routes[0]);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(
        result.routes[0],
      );
      expect((result.routes[0] as any).initializeControls).toHaveBeenCalledWith(
        mockCanvasManager.getRawCanvas(),
      );

      // Assert: Render-Cycle angestoßen
      expect(mockCanvasManager.requestRender).toHaveBeenCalledTimes(1);
    });

    it("sollte Deep-Copies der Nodes anlegen", () => {
      const originalNodes = [{ x: 50, y: 50, type: SegmentType.STRAIGHT }];
      const playData: PlayImportData = {
        fieldPresetId: "STANDARD",
        players: [],
        routes: [
          {
            id: "r1",
            playerId: "p1",
            routeType: "main",
            color: "#000",
            nodes: originalNodes,
          },
        ],
      };

      const result = playManager.loadPlay(playData);
      const newRoute = result.routes[0] as any;

      // Inhalt ist gleich, aber die Referenz darf nicht dieselbe sein (JSON.parse(JSON.stringify...))
      expect(newRoute.config.nodes).toEqual(originalNodes);
      expect(newRoute.config.nodes).not.toBe(originalNodes);
    });
  });
});
