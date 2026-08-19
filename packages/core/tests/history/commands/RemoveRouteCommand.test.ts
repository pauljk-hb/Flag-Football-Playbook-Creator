import { PlayerEntity } from "@/entities/PlayerEntity";
import { RouteEntity } from "@/entities/RouteEntity";
import { RemoveRouteCommand } from "@/history/commands/RemoveRouteCommand";
import type { CanvasManager } from "@/managers/CanvasManager";
import type { NotificationManager } from "@/managers/NotificationManager";
import type { PlayManager } from "@/managers/PlayManager";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("RemoveRouteCommand", () => {
  let command: RemoveRouteCommand;
  let mockPlayManager: PlayManager;
  let mockCanvasManager: CanvasManager;
  let mockNotificationManager: NotificationManager;

  let mockRoute: RouteEntity;
  let mockPlayer: PlayerEntity;
  let mockRawCanvas: any;

  beforeEach(() => {
    // 1. Entities mocken (inklusive Prototypen)
    mockRoute = {
      id: "route-1",
      playerId: "player-1",
      destroyAllHandles: vi.fn(),
      initializeControls: vi.fn(),
    } as any;
    Object.setPrototypeOf(mockRoute, RouteEntity.prototype);

    mockPlayer = {
      id: "player-1",
    } as any;
    Object.setPrototypeOf(mockPlayer, PlayerEntity.prototype);

    mockRawCanvas = { type: "fabric-canvas" };

    // 2. Manager mocken
    mockPlayManager = {
      // getEntity intelligent mocken, um abhängig von der ID das richtige Objekt zu liefern
      getEntity: vi.fn().mockImplementation((id: string) => {
        if (id === "route-1") return mockRoute;
        if (id === "player-1") return mockPlayer;
        return undefined; // Simulation für nicht gefundene Entitäten
      }),
      removeEntity: vi.fn(),
      addEntity: vi.fn(),
    } as any;

    mockCanvasManager = {
      removeEntity: vi.fn(),
      addEntity: vi.fn(),
      getRawCanvas: vi.fn().mockReturnValue(mockRawCanvas),
      bringObjectToFront: vi.fn(),
    } as any;

    mockNotificationManager = {
      sendFeedback: vi.fn(),
    } as any;

    // 3. Command für den "Happy Path" initialisieren
    command = new RemoveRouteCommand(
      "route-1",
      mockPlayManager,
      mockCanvasManager,
      mockNotificationManager,
    );
  });

  describe("Konstruktor", () => {
    it("sollte die Route und den dazugehörigen Spieler aus dem PlayManager laden", () => {
      // Assert: getEntity wurde für Route und Spieler aufgerufen
      expect(mockPlayManager.getEntity).toHaveBeenCalledWith("route-1");
      expect(mockPlayManager.getEntity).toHaveBeenCalledWith("player-1");

      // Assert: Referenzen wurden korrekt zugewiesen
      expect((command as any).route).toBe(mockRoute);
      expect((command as any).player).toBe(mockPlayer);

      // Assert: Keine Warnung im Happy Path
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });

    it("sollte einen Fehler werfen, wenn die Route nicht gefunden wird (Edge Case: TypeError vor der Warnung)", () => {
      // Act & Assert
      // Da die Klasse `this.route.playerId` aufruft, bevor `this.route` auf undefined geprüft wird,
      // erwarten wir hier einen nativen JavaScript Fehler (TypeError).
      expect(() => {
        new RemoveRouteCommand(
          "unknown-route",
          mockPlayManager,
          mockCanvasManager,
          mockNotificationManager,
        );
      }).toThrow(TypeError);

      // Hinweis: Der NotificationManager wird durch den Crash nie erreicht
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });
  });

  describe("execute()", () => {
    it("sollte die Handles der Route zerstören und die Route aus beiden Managern entfernen", () => {
      // Act
      command.execute();

      // Assert
      expect(mockRoute.destroyAllHandles).toHaveBeenCalledTimes(1);
      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(mockRoute); // CanvasManager erwartet Instanz
      expect(mockPlayManager.removeEntity).toHaveBeenCalledWith("route-1"); // PlayManager erwartet ID
    });
  });

  describe("undo()", () => {
    it("sollte die Route neu initialisieren, hinzufügen und den Spieler in den Vordergrund bringen", () => {
      // Act
      command.undo();

      // Assert: Controls initialisieren
      expect(mockCanvasManager.getRawCanvas).toHaveBeenCalledTimes(1);
      expect(mockRoute.initializeControls).toHaveBeenCalledWith(mockRawCanvas);

      // Assert: Route wiederherstellen
      expect(mockPlayManager.addEntity).toHaveBeenCalledWith(mockRoute);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(mockRoute);

      // Assert: Spieler wird optisch nach vorne geholt
      expect(mockCanvasManager.bringObjectToFront).toHaveBeenCalledWith(
        mockPlayer,
      );
    });
  });
});
