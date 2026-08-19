import { HistoryManager } from "@/history/HistoryManager";
import type { ICommand } from "@/types/history";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("HistoryManager", () => {
  let historyManager: HistoryManager;

  const createMockCommand = (): ICommand => ({
    execute: vi.fn(),
    undo: vi.fn(),
  });

  beforeEach(() => {
    historyManager = new HistoryManager();
  });

  describe("Basis-Ausführung (execute)", () => {
    it("sollte ein Command ausführen und in den Undo-Stack legen", () => {
      const cmd = createMockCommand();

      historyManager.execute(cmd);

      expect(cmd.execute).toHaveBeenCalledOnce();
      expect(historyManager.canUndo()).toBe(true);
      expect(historyManager.canRedo()).toBe(false);
    });

    it("sollte den Redo-Stack leeren, wenn ein neues Command ausgeführt wird", () => {
      const cmd1 = createMockCommand();
      const cmd2 = createMockCommand();

      historyManager.execute(cmd1);
      historyManager.undo();

      expect(historyManager.canRedo()).toBe(true);

      historyManager.execute(cmd2);

      expect(historyManager.canRedo()).toBe(false);
    });
  });

  describe("Undo & Redo", () => {
    it("sollte undo() korrekt ausführen", () => {
      const cmd = createMockCommand();
      historyManager.execute(cmd);

      historyManager.undo();

      expect(cmd.undo).toHaveBeenCalledOnce();
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(true);
    });

    it("sollte nichts tun, wenn undo() aufgerufen wird, aber der Stack leer ist", () => {
      historyManager.undo();
      expect(historyManager.canUndo()).toBe(false);
    });

    it("sollte redo() korrekt ausführen", () => {
      const cmd = createMockCommand();
      historyManager.execute(cmd);
      historyManager.undo();

      historyManager.redo();

      expect(cmd.execute).toHaveBeenCalledTimes(2);
      expect(historyManager.canUndo()).toBe(true);
      expect(historyManager.canRedo()).toBe(false);
    });

    it("sollte nichts tun, wenn redo() aufgerufen wird, aber der Stack leer ist", () => {
      historyManager.redo();
      expect(historyManager.canRedo()).toBe(false);
    });
  });

  describe("Zustand und Aufräumen (clear)", () => {
    it("sollte mit clear() alle Stacks leeren", () => {
      const cmd = createMockCommand();
      historyManager.execute(cmd);

      historyManager.clear();

      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(false);
    });
  });

  describe("Subscriptions (Observer Pattern)", () => {
    it("sollte Listener benachrichtigen, wenn sich der Zustand ändert", () => {
      const listener = vi.fn();
      historyManager.subscribe(listener);

      const cmd = createMockCommand();

      historyManager.execute(cmd); // Aufruf 1
      historyManager.undo(); // Aufruf 2
      historyManager.redo(); // Aufruf 3
      historyManager.clear(); // Aufruf 4

      expect(listener).toHaveBeenCalledTimes(4);
    });

    it("sollte Listener nach dem Unsubscribe nicht mehr benachrichtigen", () => {
      const listener = vi.fn();
      const unsubscribe = historyManager.subscribe(listener);

      const cmd = createMockCommand();
      historyManager.execute(cmd); // Aufruf 1

      unsubscribe(); // Wir melden den Listener ab

      historyManager.undo(); // Listener sollte das nicht mehr mitbekommen

      expect(listener).toHaveBeenCalledTimes(1); // Bleibt bei 1
    });
  });
});
