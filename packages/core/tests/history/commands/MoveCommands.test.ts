import { PlayerEntity } from "@/entities/PlayerEntity";
import { RouteEntity } from "@/entities/RouteEntity";
import {
  MovePlayerCommand,
  MoveRouteCommand,
} from "@/history/commands/MoveCommands";
import type { CanvasManager } from "@/managers/CanvasManager";
import type { NotificationManager } from "@/managers/NotificationManager";
import type { PlayManager } from "@/managers/PlayManager";
import type { RouteNode } from "@/types/interfaces";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("MovePlayerCommand", () => {
  let command: MovePlayerCommand;
  let mockPlayManager: PlayManager;
  let mockCanvasManager: CanvasManager;
  let mockNotificationManager: NotificationManager;
  let mockPlayer: PlayerEntity;
  let mockRoute: RouteEntity;

  beforeEach(() => {
    mockPlayer = {
      id: "player-1",
      setPosition: vi.fn(),
    } as any;
    Object.setPrototypeOf(mockPlayer, PlayerEntity.prototype);

    mockRoute = {
      id: "route-1",
      translate: vi.fn(),
    } as any;
    Object.setPrototypeOf(mockRoute, RouteEntity.prototype);

    mockPlayManager = {
      getEntity: vi.fn().mockReturnValue(mockPlayer),
      getAllRoutesFromPlayer: vi.fn().mockReturnValue([mockRoute]),
    } as any;

    mockCanvasManager = {
      requestRender: vi.fn(),
    } as any;

    mockNotificationManager = {
      sendFeedback: vi.fn(),
    } as any;

    command = new MovePlayerCommand(
      "player-1",
      10,
      10,
      20,
      30,
      mockPlayManager,
      mockCanvasManager,
      mockNotificationManager,
    );
  });

  describe("execute()", () => {
    it("sollte die Position des Spielers updaten, Routen verschieben und rendern", () => {
      command.execute();

      expect(mockPlayManager.getEntity).toHaveBeenCalledWith("player-1");
      expect(mockPlayer.setPosition).toHaveBeenCalledWith(20, 30);

      expect(mockPlayManager.getAllRoutesFromPlayer).toHaveBeenCalledWith(
        "player-1",
      );
      expect(mockRoute.translate).toHaveBeenCalledWith(10, 20);

      expect(mockCanvasManager.requestRender).toHaveBeenCalledTimes(1);
    });

    it("sollte eine Warnung senden und abbrechen, wenn der Spieler nicht gefunden wird", () => {
      (mockPlayManager.getEntity as any).mockReturnValue(null);

      command.execute();

      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );
      expect(mockPlayer.setPosition).not.toHaveBeenCalled();
      expect(mockCanvasManager.requestRender).not.toHaveBeenCalled();
    });
  });

  describe("undo()", () => {
    it("sollte den Spieler auf die Startposition zurücksetzen, Routen negativ verschieben und rendern", () => {
      command.undo();

      expect(mockPlayer.setPosition).toHaveBeenCalledWith(10, 10);

      expect(mockRoute.translate).toHaveBeenCalledWith(-10, -20);

      expect(mockCanvasManager.requestRender).toHaveBeenCalledTimes(1);
    });

    it("sollte eine Warnung senden und abbrechen, wenn der Spieler bei undo nicht gefunden wird", () => {
      (mockPlayManager.getEntity as any).mockReturnValue(undefined);

      command.undo();

      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Es ist kein Spieler ausgewählt!",
      );
      expect(mockPlayer.setPosition).not.toHaveBeenCalled();
    });
  });
});

describe("MoveRouteCommand", () => {
  let command: MoveRouteCommand;
  let mockPlayManager: PlayManager;
  let mockCanvasManager: CanvasManager;
  let mockNotificationManager: NotificationManager;
  let mockRoute: RouteEntity;

  let oldNodes: RouteNode[];
  let newNodes: RouteNode[];
  let mockFabricCanvas: any;

  beforeEach(() => {
    oldNodes = [{ x: 0, y: 0 }] as any;
    newNodes = [{ x: 100, y: 100 }] as any;
    mockFabricCanvas = { type: "fabric-canvas" };

    mockRoute = {
      id: "route-1",
      nodes: [],
      getFabricObjects: vi.fn().mockReturnValue([{ canvas: mockFabricCanvas }]),
      applyNodes: vi.fn(),
    } as any;
    Object.setPrototypeOf(mockRoute, RouteEntity.prototype);

    mockPlayManager = {
      getEntity: vi.fn().mockReturnValue(mockRoute),
    } as any;

    mockCanvasManager = {
      requestRender: vi.fn(),
    } as any;

    mockNotificationManager = {
      sendFeedback: vi.fn(),
    } as any;

    command = new MoveRouteCommand(
      "route-1",
      oldNodes,
      newNodes,
      mockPlayManager,
      mockCanvasManager,
      mockNotificationManager,
    );
  });

  describe("execute()", () => {
    it("sollte die Nodes der Route updaten, applyNodes mit dem Canvas aufrufen und rendern", () => {
      // Act
      command.execute();

      // Assert: Entität abrufen
      expect(mockPlayManager.getEntity).toHaveBeenCalledWith("route-1");

      // Assert: Deep Copy der neuen Nodes wurde zugewiesen
      expect(mockRoute.nodes).toEqual(newNodes);
      expect(mockRoute.nodes).not.toBe(newNodes); // Muss eine Referenzkopie sein

      // Assert: applyNodes wurde mit newNodes und dem Canvas aus getFabricObjects aufgerufen
      expect(mockRoute.getFabricObjects).toHaveBeenCalledTimes(1);
      expect(mockRoute.applyNodes).toHaveBeenCalledWith(
        newNodes,
        mockFabricCanvas,
      );

      expect(mockCanvasManager.requestRender).toHaveBeenCalledTimes(1);
    });

    it("sollte eine Warnung ausgeben und abbrechen, wenn die Route nicht gefunden wird", () => {
      // Setup
      (mockPlayManager.getEntity as any).mockReturnValue(null);

      // Act
      command.execute();

      // Assert
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Es ist keine Spieler Route!",
      );
      expect(mockRoute.applyNodes).not.toHaveBeenCalled();
      expect(mockCanvasManager.requestRender).not.toHaveBeenCalled();
    });
  });

  describe("undo()", () => {
    it("sollte die Nodes der Route auf oldNodes zurücksetzen, applyNodes aufrufen und rendern", () => {
      // Act
      command.undo();

      // Assert
      expect(mockRoute.nodes).toEqual(oldNodes);
      expect(mockRoute.nodes).not.toBe(oldNodes); // Referenz-Check für Deep Copy

      expect(mockRoute.applyNodes).toHaveBeenCalledWith(
        oldNodes,
        mockFabricCanvas,
      );
      expect(mockCanvasManager.requestRender).toHaveBeenCalledTimes(1);
    });

    it("sollte stumm abbrechen (ohne Warnung), wenn die Route nicht gefunden wird", () => {
      // Setup
      (mockPlayManager.getEntity as any).mockReturnValue(undefined);

      // Act
      command.undo();

      // Assert: Kein Error/Warning laut Implementierung
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
      expect(mockRoute.applyNodes).not.toHaveBeenCalled();
      expect(mockCanvasManager.requestRender).not.toHaveBeenCalled();
    });
  });
});
