import { PlayerEntity } from "@/entities/PlayerEntity";
import { AddPlayerCommand } from "@/history/commands/AddPlayerCommand";
import type { CanvasManager } from "@/managers/CanvasManager";
import type { PlayManager } from "@/managers/PlayManager";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("AddPlayerCommand", () => {
  let command: AddPlayerCommand;
  let mockCanvasManager: CanvasManager;
  let mockPlayManager: PlayManager;
  let mockPlayerEntity: PlayerEntity;

  beforeEach(() => {
    mockPlayerEntity = {
      id: "player-123",
    } as any;
    Object.setPrototypeOf(mockPlayerEntity, PlayerEntity.prototype);

    mockCanvasManager = {
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
    } as any;

    mockPlayManager = {
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
    } as any;

    command = new AddPlayerCommand(
      mockPlayerEntity,
      mockCanvasManager,
      mockPlayManager,
    );
  });

  describe("execute()", () => {
    it("sollte die PlayerEntity zum PlayManager und CanvasManager hinzufügen", () => {
      command.execute();

      expect(mockPlayManager.addEntity).toHaveBeenCalledTimes(1);
      expect(mockPlayManager.addEntity).toHaveBeenCalledWith(mockPlayerEntity);

      expect(mockCanvasManager.addEntity).toHaveBeenCalledTimes(1);
      expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(
        mockPlayerEntity,
      );
    });
  });

  describe("undo()", () => {
    it("sollte die PlayerEntity aus dem CanvasManager (via Instanz) und PlayManager (via ID) entfernen", () => {
      command.undo();

      expect(mockCanvasManager.removeEntity).toHaveBeenCalledTimes(1);
      expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(
        mockPlayerEntity,
      );

      expect(mockPlayManager.removeEntity).toHaveBeenCalledTimes(1);
      expect(mockPlayManager.removeEntity).toHaveBeenCalledWith("player-123");
    });

    it("sollte keinen Fehler werfen, wenn die ID fehlt (Edge Case)", () => {
      const entityWithoutId = {} as any;
      Object.setPrototypeOf(entityWithoutId, PlayerEntity.prototype);

      const edgeCommand = new AddPlayerCommand(
        entityWithoutId,
        mockCanvasManager,
        mockPlayManager,
      );

      edgeCommand.undo();

      expect(mockPlayManager.removeEntity).toHaveBeenCalledWith(undefined);
    });
  });
});
