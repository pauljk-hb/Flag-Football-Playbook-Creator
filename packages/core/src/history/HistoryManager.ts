import type { HistoryListener, ICommand,  } from '../types/history';

export class HistoryManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  private listeners: HistoryListener[] = [];

  public subscribe(listener: HistoryListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Führt einen neuen Befehl aus und legt ihn auf den Undo-Stack.
   * Löscht den Redo-Stack, da eine neue Aktion einen neuen Zeitstrang erzeugt.
   */
  public execute(command: ICommand): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.notify();
  }

  public undo(): void {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
        this.notify();
    }
  }

  public redo(): void {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.undoStack.push(command);
        this.notify();
    }
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }
  
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}