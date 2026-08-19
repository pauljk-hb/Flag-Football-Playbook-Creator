import { RouteEntity } from "@/entities/RouteEntity";
import { AddRouteCommand } from "@/history/commands/AddRouteCommand";
import type { CanvasManager } from "@/managers/CanvasManager";
import type { PlayManager } from "@/managers/PlayManager";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("AddRouteCommand", () => {
  let mockCanvasManager: CanvasManager;
  let mockPlayManager: PlayManager;
  let newRouteEntity: RouteEntity;
  let oldRouteEntity: RouteEntity;
  let commandWithoutOld: AddRouteCommand;
  let commandWithOld: AddRouteCommand;

  const mockRawCanvas = { type: "fabric-canvas-mock" };

  beforeEach(() => {
    mockCanvasManager = {
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      getRawCanvas: vi.fn().mockReturnValue(mockRawCanvas),
      requestRender: vi.fn(),
    } as any;

    mockPlayManager = {
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
    } as any;

    newRouteEntity = {
      id: "route-new-123",
      destroyAllHandles: vi.fn(),
      initializeControls: vi.fn(),
    } as any;
    Object.setPrototypeOf(newRouteEntity, RouteEntity.prototype);

    oldRouteEntity = {
      id: "route-old-456",
      destroyAllHandles: vi.fn(),
      initializeControls: vi.fn(),
    } as any;
    Object.setPrototypeOf(oldRouteEntity, RouteEntity.prototype);

    commandWithoutOld = new AddRouteCommand(
      newRouteEntity,
      mockPlayManager,
      mockCanvasManager,
    );
    commandWithOld = new AddRouteCommand(
      newRouteEntity,
      mockPlayManager,
      mockCanvasManager,
      oldRouteEntity,
    );
  });

  describe("execute()", () => {
    describe("ohne oldRouteEntity (Standard Add)", () => {
      it("sollte die neue Route in Manager einfügen, Controls initialisieren und Rendern", () => {
        commandWithoutOld.execute();

        expect(mockCanvasManager.removeEntity).not.toHaveBeenCalled();
        expect(mockPlayManager.removeEntity).not.toHaveBeenCalled();

        expect(mockPlayManager.addEntity).toHaveBeenCalledWith(newRouteEntity);
        expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(
          newRouteEntity,
        );

        expect(newRouteEntity.initializeControls).toHaveBeenCalledWith(
          mockRawCanvas,
        );
        expect(mockCanvasManager.requestRender).toHaveBeenCalledTimes(1);
      });
    });

    describe("mit oldRouteEntity (Replace)", () => {
      it("sollte die alte Route zuerst sauber entfernen (inkl. Handles zerstören)", () => {
        commandWithOld.execute();

        expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(
          oldRouteEntity,
        );
        expect(oldRouteEntity.destroyAllHandles).toHaveBeenCalledTimes(1);
        expect(mockPlayManager.removeEntity).toHaveBeenCalledWith(
          "route-old-456",
        );

        expect(mockPlayManager.addEntity).toHaveBeenCalledWith(newRouteEntity);
        expect(newRouteEntity.initializeControls).toHaveBeenCalledWith(
          mockRawCanvas,
        );
      });
    });
  });

  describe("undo()", () => {
    describe("ohne oldRouteEntity (Standard Undo)", () => {
      it("sollte die neue Route entfernen und deren Handles zerstören", () => {
        commandWithoutOld.undo();

        expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(
          newRouteEntity,
        );
        expect(newRouteEntity.destroyAllHandles).toHaveBeenCalledTimes(1);
        expect(mockPlayManager.removeEntity).toHaveBeenCalledWith(
          "route-new-123",
        );

        expect(mockPlayManager.addEntity).not.toHaveBeenCalled();
      });
    });

    describe("mit oldRouteEntity (Undo Replace)", () => {
      it("sollte die neue Route entfernen und die alte Route vollständig wiederherstellen", () => {
        commandWithOld.undo();

        expect(mockCanvasManager.removeEntity).toHaveBeenCalledWith(
          newRouteEntity,
        );
        expect(newRouteEntity.destroyAllHandles).toHaveBeenCalledTimes(1);
        expect(mockPlayManager.removeEntity).toHaveBeenCalledWith(
          "route-new-123",
        );

        expect(mockPlayManager.addEntity).toHaveBeenCalledWith(oldRouteEntity);
        expect(mockCanvasManager.addEntity).toHaveBeenCalledWith(
          oldRouteEntity,
        );
        expect(oldRouteEntity.initializeControls).toHaveBeenCalledWith(
          mockRawCanvas,
        );
      });

      it("sollte keinen Fehler werfen, wenn die IDs der Entities zur Laufzeit fehlen (Edge Case)", () => {
        const newEntityWithoutId = {
          destroyAllHandles: vi.fn(),
          initializeControls: vi.fn(),
        } as any;
        Object.setPrototypeOf(newEntityWithoutId, RouteEntity.prototype);

        const oldEntityWithoutId = {
          destroyAllHandles: vi.fn(),
          initializeControls: vi.fn(),
        } as any;
        Object.setPrototypeOf(oldEntityWithoutId, RouteEntity.prototype);

        const edgeCommand = new AddRouteCommand(
          newEntityWithoutId,
          mockPlayManager,
          mockCanvasManager,
          oldEntityWithoutId,
        );

        expect(() => edgeCommand.undo()).not.toThrow();
        expect(mockPlayManager.removeEntity).toHaveBeenCalledWith(undefined);
      });
    });
  });
});
