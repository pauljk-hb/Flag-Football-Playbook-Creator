import { PlayerEntity } from "@/entities/PlayerEntity";
import { RouteEntity } from "@/entities/RouteEntity";
import { LoadFormationCommand } from "@/history/commands/LoadFormationCommand";
import { MovePlayerCommand } from "@/history/commands/MoveCommands";
import type { HistoryManager } from "@/history/HistoryManager";
import type { CanvasManager } from "@/managers/CanvasManager";
import type { NotificationManager } from "@/managers/NotificationManager";
import type { PlayManager } from "@/managers/PlayManager";
import type { PlayerImportData } from "@/types/interfaces";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/entities/PlayerEntity", () => {
  class MockPlayerEntity {
    id: string;
    onMoveComplete?: Function;
    x: number;
    y: number;
    style: any;
    styleOverride: any;

    constructor(config: any) {
      this.id = config.id || `mock-player-${Math.random()}`;
      this.x = config.x;
      this.y = config.y;
      this.style = config.style;
      this.styleOverride = config.styleOverride;
    }
  }
  return { PlayerEntity: MockPlayerEntity };
});

vi.mock("@/entities/RouteEntity", () => {
  class MockRouteEntity {
    id = "mock-route-id";
    destroyAllHandles = vi.fn();
    initializeControls = vi.fn();
    getFabricObjects = vi.fn().mockReturnValue(["mock-fabric-obj"]);
  }
  return { RouteEntity: MockRouteEntity };
});

vi.mock("@/commands/MoveCommands", () => {
  class MockMovePlayerCommand {
    constructor(...args: any[]) {}
  }
  return { MovePlayerCommand: MockMovePlayerCommand };
});

describe("LoadFormationCommand", () => {
  let command: LoadFormationCommand;
  let mockPlayManager: PlayManager;
  let mockCanvasManager: CanvasManager;
  let mockHistoryManager: HistoryManager;
  let mockNotificationManager: NotificationManager;
  let spawnData: PlayerImportData[];

  let oldPlayer: PlayerEntity;
  let oldRoute: RouteEntity;

  beforeEach(() => {
    spawnData = [
      {
        id: "p1",
        x: 10,
        y: 10,
        style: {
          label: "QB",
          color: "#ff0000",
          shape: "circle",
          showLabel: true,
        },
      },
      {
        id: "p2",
        x: 20,
        y: 20,
        style: {
          label: "WR",
          color: "#00ff00",
          shape: "square",
          showLabel: true,
        },
      },
    ];

    oldPlayer = new PlayerEntity({
      id: "old-p1",
      x: 0,
      y: 0,
      style: {
        label: "OLD_QB",
        color: "#111",
        shape: "circle",
        showLabel: true,
      },
    });
    oldRoute = new RouteEntity({} as any);

    mockPlayManager = {
      getAllEntities: vi
        .fn()
        .mockReturnValue([oldPlayer, oldRoute, { id: "some-other-entity" }]),
      clearPlay: vi.fn(),
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      getAllRoutesFromPlayer: vi.fn().mockReturnValue([oldRoute]),
    } as any;

    mockCanvasManager = {
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      requestRender: vi.fn(),
      getRawCanvas: vi.fn().mockReturnValue("mock-raw-canvas"),
      sendToBack: vi.fn(),
    } as any;

    mockHistoryManager = {
      execute: vi.fn(),
    } as any;

    mockNotificationManager = {} as any;

    command = new LoadFormationCommand(
      spawnData,
      mockPlayManager,
      mockCanvasManager,
      mockHistoryManager,
      mockNotificationManager,
    );
  });

  describe("execute()", () => {
    it("sollte alle existierenden Entitäten entfernen und das Play leeren", () => {
      command.execute();

      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(oldPlayer);
      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(oldRoute);

      expect(oldRoute.destroyAllHandles).toHaveBeenCalledTimes(1);

      expect(mockPlayManager.clearPlay).toHaveBeenCalledTimes(1);
    });

    it("sollte neue Spieler basierend auf spawnData erstellen und in die Manager einfügen", () => {
      command.execute();

      expect(mockPlayManager.addEntity).toHaveBeenCalledTimes(2);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledTimes(2);

      expect(mockCanvasManager.requestRender).toHaveBeenCalledTimes(1);
    });

    it("sollte onMoveComplete-Callback auf den neuen Spielern registrieren, der MovePlayerCommand triggert", () => {
      command.execute();

      const addedPlayer = (mockPlayManager.addEntity as any).mock
        .calls[0][0] as PlayerEntity;

      expect(addedPlayer.onMoveComplete).toBeDefined();

      addedPlayer.onMoveComplete!(addedPlayer.id, 0, 0, 100, 100);

      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(1);

      const executedCommand = (mockHistoryManager.execute as any).mock
        .calls[0][0];
      expect(executedCommand).toBeInstanceOf(MovePlayerCommand);
    });

    it("sollte keine Fehler werfen, wenn spawnData leer ist (Edge Case)", () => {
      const emptyCommand = new LoadFormationCommand(
        [],
        mockPlayManager,
        mockCanvasManager,
        mockHistoryManager,
        mockNotificationManager,
      );

      expect(() => emptyCommand.execute()).not.toThrow();
      expect(mockPlayManager.addEntity).not.toHaveBeenCalled();
    });
  });

  describe("undo()", () => {
    beforeEach(() => {
      command.execute();

      vi.clearAllMocks();
    });

    it("sollte die neuen Spieler entfernen", () => {
      command.undo();

      expect(mockCanvasManager.removeEntity).toHaveBeenCalledTimes(2);
      expect(mockPlayManager.removeEntity).toHaveBeenCalledTimes(2);
    });

    it("sollte die vorherigen Spieler und deren Routen wiederherstellen", () => {
      command.undo();

      expect(mockPlayManager.addEntity).toHaveBeenCalledWith(oldPlayer);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(oldPlayer);

      expect(mockPlayManager.getAllRoutesFromPlayer).toHaveBeenCalledWith(
        oldPlayer.id,
      );

      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(oldRoute);
      expect(oldRoute.initializeControls).toHaveBeenCalledWith(
        "mock-raw-canvas",
      );

      expect(mockCanvasManager.sendToBack).toHaveBeenCalledWith(
        "mock-fabric-obj",
      );

      expect(mockCanvasManager.requestRender).toHaveBeenCalled();
    });
  });
});
