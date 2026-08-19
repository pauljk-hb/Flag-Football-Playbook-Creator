import type { NotificationManager } from "@/managers/NotificationManager";
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
    PLAYER_PRESETS: {
      qb: { id: "qb", label: "QB", color: "#ff0000", shape: "circle" },
      wr: { id: "wr", label: "WR", color: "#00ff00", shape: "square" },
    },
  };
});

describe("FormationBuilder", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let mockNotificationManager: NotificationManager;

  beforeEach(() => {
    // 2. Spy auf console.warn setzen, um Ausgaben abzufangen
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // 3. Mock für den NotificationManager erstellen
    mockNotificationManager = {
      sendFeedback: vi.fn(),
    } as any;
  });

  afterEach(() => {
    // Nach jedem Test den Console-Spy aufräumen
    consoleWarnSpy.mockRestore();
  });

  describe("build()", () => {
    it("sollte eine gültige Formation in absolute Spawn-Daten umwandeln (Happy Path)", () => {
      // Setup
      const originX = 100;
      const originY = 200;

      // Act
      const result = FormationBuilder.build(
        "valid-formation",
        originX,
        originY,
        mockNotificationManager,
      );

      // Assert
      expect(result).toHaveLength(2);

      expect(result[0]).toEqual({
        presetId: "qb",
        x: 100 + 0, // originX + dx
        y: 200 + 10, // originY + dy
        label: "QB",
        color: "#ff0000",
        shape: "circle",
      });

      expect(result[1]).toEqual({
        presetId: "wr",
        x: 100 - 20,
        y: 200 + 0,
        label: "WR",
        color: "#00ff00",
        shape: "square",
      });

      // Warnungen oder Feedback sollten nicht gefeuert werden
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });

    it("sollte via console und NotificationManager warnen, wenn die Formation nicht existiert", () => {
      // Act
      const result = FormationBuilder.build(
        "non-existent-formation",
        100,
        100,
        mockNotificationManager,
      );

      // Assert: Rückgabe ist leer
      expect(result).toEqual([]);

      // Assert: console.warn wurde aufgerufen
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Formation non-existent-formation nicht gefunden!",
      );

      // Assert: NotificationManager wurde aufgerufen
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledTimes(1);
      expect(mockNotificationManager.sendFeedback).toHaveBeenCalledWith(
        "warning",
        "Formation non-existent-formation nicht gefunden!",
      );
    });

    it("sollte Spieler ignorieren, deren Preset-ID nicht existiert (Edge Case)", () => {
      // Act
      const result = FormationBuilder.build(
        "partial-invalid-formation",
        100,
        100,
        mockNotificationManager,
      );

      // Assert: 'unknown-player' wird durch if(!playerPreset) übersprungen
      expect(result).toHaveLength(1);
      expect(result[0].presetId).toBe("qb");

      // Für diesen Fall werfen wir bewusst kein Feedback laut Code
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });

    it("sollte ein leeres Array zurückgeben, wenn die Formation existiert, aber keine Positionen hat", () => {
      // Act
      const result = FormationBuilder.build(
        "empty-formation",
        100,
        100,
        mockNotificationManager,
      );

      // Assert
      expect(result).toEqual([]);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(mockNotificationManager.sendFeedback).not.toHaveBeenCalled();
    });
  });
});
