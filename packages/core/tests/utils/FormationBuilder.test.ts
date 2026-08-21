import type { NotificationManager } from "@/managers/NotificationManager";
import type { PlayerStyle } from "@/types/interfaces";
import { FormationBuilder } from "@/utils/FormationBuilder";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 1. Mock für die statischen Preset-Daten
vi.mock("@/data/presets/index", () => {
  return {
    FORMATION_PRESETS: {
      "valid-formation": {
        positions: [
          { playerPresetId: "qb", dx: 0, dy: 10 },
          { playerPresetId: "wr", dx: -20, dy: 0 },
        ],
      },
      "empty-formation": {
        positions: [],
      },
      "partial-invalid-formation": {
        positions: [
          { playerPresetId: "qb", dx: 0, dy: 10 },
          { playerPresetId: "unknown-player", dx: 50, dy: 50 },
        ],
      },
    },
  };
});

describe("FormationBuilder", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let mockNotificationManager: NotificationManager;
  let mockPlayerStyles: Record<string, PlayerStyle>;

  beforeEach(() => {
    // 2. Spy auf console.warn setzen, um Ausgaben abzufangen
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // 3. Mock für den NotificationManager erstellen
    mockNotificationManager = {
      sendFeedback: vi.fn(),
    } as any;

    // 4. PlayerStyles bereitstellen
    mockPlayerStyles = {
      qb: { label: "QB", color: "#ff0000", shape: "circle", showLabel: true },
      wr: { label: "WR", color: "#00ff00", shape: "square", showLabel: true },
    };
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("build()", () => {
    it("sollte eine gültige Formation in absolute Spawn-Daten umwandeln (Happy Path)", () => {
      const originX = 100;
      const originY = 200;

      const result = FormationBuilder.build(
        "valid-formation",
        mockPlayerStyles,
        originX,
        originY,
        mockNotificationManager,
      );

      expect(result).toHaveLength(2);

      expect(result[0]).toEqual({
        role: "qb",
        x: 100 + 0,
        y: 200 + 10,
        style: {
          label: "QB",
          color: "#ff0000",
          shape: "circle",
          showLabel: true,
        },
      });

      expect(result[1]).toEqual({
        role: "wr",
        x: 100 - 20,
        y: 200 + 0,
        style: {
          label: "WR",
          color: "#00ff00",
          shape: "square",
          showLabel: true,
        },
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });

    it("sollte via console und NotificationManager warnen, wenn die Formation nicht existiert", () => {
      const result = FormationBuilder.build(
        "non-existent-formation",
        mockPlayerStyles,
        100,
        100,
        mockNotificationManager,
      );

      expect(result).toEqual([]);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Formation non-existent-formation nicht gefunden!",
      );

      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledTimes(1);
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Formation non-existent-formation nicht gefunden!",
      );
    });

    it("sollte für unbekannte Rollen-Styles den Default-Fallback verwenden", () => {
      const result = FormationBuilder.build(
        "partial-invalid-formation",
        mockPlayerStyles,
        100,
        100,
        mockNotificationManager,
      );

      expect(result).toHaveLength(2);

      expect(result[0].role).toBe("qb");
      expect(result[0].style).toEqual(mockPlayerStyles.qb);

      expect(result[1]).toEqual({
        role: "unknown-player",
        x: 150,
        y: 150,
        style: {
          color: "#3b82f6",
          label: "unknown-player",
          shape: "circle",
          showLabel: true,
        },
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });

    it("sollte ein leeres Array zurückgeben, wenn die Formation existiert, aber keine Positionen hat", () => {
      const result = FormationBuilder.build(
        "empty-formation",
        mockPlayerStyles,
        100,
        100,
        mockNotificationManager,
      );

      expect(result).toEqual([]);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });
  });
});
