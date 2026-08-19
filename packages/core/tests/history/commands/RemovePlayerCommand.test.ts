import { PlayerEntity } from "@/entities/PlayerEntity";
import { RouteEntity } from "@/entities/RouteEntity";
import { RemovePlayerCommand } from "@/history/commands/RemovePlayerCommand";
import type { CanvasManager } from "@/managers/CanvasManager";
import type { NotificationManager } from "@/managers/NotificationManager";
import type { PlayManager } from "@/managers/PlayManager";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("RemovePlayerCommand", () => {
  let command: RemovePlayerCommand;
  let mockPlayManager: PlayManager;
  let mockCanvasManager: CanvasManager;
  let mockNotificationManager: NotificationManager;

  let mockPlayer: PlayerEntity;
  let mockRoute1: RouteEntity;
  let mockRoute2: RouteEntity;
  let mockRawCanvas: any;

  beforeEach(() => {
    // 1. Entities mocken (inklusive Prototypen für eventuelle instanceof-Checks in den Managern)
    mockPlayer = {
      id: "player-1",
    } as any;
    Object.setPrototypeOf(mockPlayer, PlayerEntity.prototype);

    mockRoute1 = {
      id: "route-1",
      destroyAllHandles: vi.fn(),
      initializeControls: vi.fn(),
    } as any;
    Object.setPrototypeOf(mockRoute1, RouteEntity.prototype);

    mockRoute2 = {
      id: "route-2",
      destroyAllHandles: vi.fn(),
      initializeControls: vi.fn(),
    } as any;
    Object.setPrototypeOf(mockRoute2, RouteEntity.prototype);

    mockRawCanvas = { type: "fabric-canvas" };

    // 2. Manager mocken
    mockPlayManager = {
      getEntity: vi.fn().mockReturnValue(mockPlayer),
      getAllRoutesFromPlayer: vi.fn().mockReturnValue([mockRoute1, mockRoute2]),
      removeEntity: vi.fn(),
      addEntity: vi.fn(),
    } as any;

    mockCanvasManager = {
      removeEntity: vi.fn(),
      addEntity: vi.fn(),
      getRawCanvas: vi.fn().mockReturnValue(mockRawCanvas),
    } as any;

    mockNotificationManager = {
      sendFeedback: vi.fn(),
    } as any;

    // 3. Command für den Happy Path initialisieren
    command = new RemovePlayerCommand(
      "player-1",
      mockPlayManager,
      mockCanvasManager,
      mockNotificationManager,
    );
  });

  describe("Konstruktor", () => {
    it("sollte den Spieler und seine Routen direkt aus dem PlayManager laden", () => {
      expect(mockPlayManager.getEntity).toHaveBeenCalledWith("player-1");
      expect(mockPlayManager.getAllRoutesFromPlayer).toHaveBeenCalledWith(
        "player-1",
      );

      expect((command as any).player).toBe(mockPlayer);
      expect((command as any).routes).toEqual([mockRoute1, mockRoute2]);
    });
  });

  describe("execute()", () => {
    it("sollte alle Routen des Spielers zerstören und aus beiden Managern entfernen", () => {
      // Act
      command.execute();

      // Assert: Routen (Instanz für Canvas, ID für PlayManager)
      expect(mockRoute1.destroyAllHandles).toHaveBeenCalledTimes(1);
      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(mockRoute1);
      expect(mockPlayManager.removeEntity).toHaveBeenCalledWith("route-1");

      expect(mockRoute2.destroyAllHandles).toHaveBeenCalledTimes(1);
      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(mockRoute2);
      expect(mockPlayManager.removeEntity).toHaveBeenCalledWith("route-2");
    });

    it("sollte den Spieler selbst aus beiden Managern entfernen", () => {
      // Act
      command.execute();

      // Assert: Spieler
      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(mockPlayer);
      expect(mockPlayManager.removeEntity).toHaveBeenCalledWith("player-1");

      // Keine Warnung im Happy Path
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });

    it("sollte abbrechen und eine Warnung senden, wenn der Spieler nicht gefunden wurde (Edge Case)", () => {
      // Setup: Leerer Spieler vom PlayManager zurückgegeben
      (mockPlayManager.getEntity as any).mockReturnValue(undefined);
      const edgeCommand = new RemovePlayerCommand(
        "unknown-player",
        mockPlayManager,
        mockCanvasManager,
        mockNotificationManager,
      );

      // Act
      edgeCommand.execute();

      // Assert: Warnung wurde gefeuert
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledTimes(1);
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );

      // Assert: Es darf nichts gelöscht worden sein
      expect(mockCanvasManager.removeEntity).not.toHaveBeenCalled();
      expect(mockPlayManager.removeEntity).not.toHaveBeenCalled();
    });
  });

  describe("undo()", () => {
    it("sollte die Routen neu initialisieren und in beide Manager einfügen", () => {
      // Act
      command.undo();

      // Assert: Routen
      expect(mockCanvasManager.getRawCanvas).toHaveBeenCalledTimes(2); // Für 2 Routen

      expect(mockRoute1.initializeControls).toHaveBeenCalledWith(mockRawCanvas);
      expect(mockPlayManager.addEntity).toHaveBeenCalledWith(mockRoute1);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(mockRoute1);

      expect(mockRoute2.initializeControls).toHaveBeenCalledWith(mockRawCanvas);
      expect(mockPlayManager.addEntity).toHaveBeenCalledWith(mockRoute2);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(mockRoute2);
    });

    it("sollte den Spieler in beide Manager einfügen", () => {
      // Act
      command.undo();

      // Assert: Spieler
      expect(mockPlayManager.addEntity).toHaveBeenCalledWith(mockPlayer);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(mockPlayer);

      // Keine Warnung im Happy Path
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });

    it("sollte abbrechen und eine Warnung senden, wenn der Spieler bei Erstellung nicht gefunden wurde (Edge Case)", () => {
      // Setup
      (mockPlayManager.getEntity as any).mockReturnValue(null);
      const edgeCommand = new RemovePlayerCommand(
        "unknown-player",
        mockPlayManager,
        mockCanvasManager,
        mockNotificationManager,
      );

      // Act
      edgeCommand.undo();

      // Assert: Warnung wurde gefeuert
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledTimes(1);
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );

      // Assert: Es darf nichts hinzugefügt worden sein
      expect(mockPlayManager.addEntity).not.toHaveBeenCalled();
      expect(mockCanvasManager.addEntity).not.toHaveBeenCalled();
    });
  });
});
