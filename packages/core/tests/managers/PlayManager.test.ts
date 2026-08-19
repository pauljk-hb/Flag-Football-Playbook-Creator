import type { BaseEntity } from "@/entities/BaseEntity";
import { PlayerEntity } from "@/entities/PlayerEntity";
import { RouteEntity } from "@/entities/RouteEntity";
import { PlayManager } from "@/managers/PlayManager";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("PlayManager", () => {
  let playManager: PlayManager;

  let mockCanvasManager: any;
  let mockHistoryManager: any;
  let mockFieldManager: any;
  let mockNotificationManager: any;

  beforeEach(() => {
    mockCanvasManager = { clear: vi.fn() };
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

  describe("Play Daten exportieren (exportPlay)", () => {
    it("sollte Spieler und Routen korrekt in das Export-Format (JSON) umwandeln", () => {
      const fakePlayer = {
        id: "p1",
        x: 100,
        y: 200,
        label: "QB",
        color: "#ff0000",
        shape: "circle",
      } as PlayerEntity;
      Object.setPrototypeOf(fakePlayer, PlayerEntity.prototype);

      const fakeRoute = {
        id: "r1",
        playerId: "p1",
        routeType: "pass",
        color: "#00ff00",
        nodes: [{ x: 10, y: 20 }],
      } as RouteEntity;
      Object.setPrototypeOf(fakeRoute, RouteEntity.prototype);

      playManager.addEntity(fakePlayer);
      playManager.addEntity(fakeRoute);

      const exportData = playManager.exportPlay();

      expect(exportData.fieldPresetId).toBe("STANDARD");
      expect(exportData.players).toHaveLength(1);
      expect(exportData.routes).toHaveLength(1);

      expect(exportData.players[0]).toEqual({
        id: "p1",
        x: 100,
        y: 200,
        label: "QB",
        color: "#ff0000",
        shape: "circle",
      });

      expect(exportData.routes[0]).toEqual({
        id: "r1",
        playerId: "p1",
        routeType: "pass",
        color: "#00ff00",
        nodes: [{ x: 10, y: 20 }],
      });
    });
  });
});
