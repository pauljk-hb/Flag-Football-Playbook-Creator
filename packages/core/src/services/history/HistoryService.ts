import type { ICommand } from "@/commands/ICommand";
import type { EventBus } from "../events/EventBus";

export class HistoryService {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  constructor(private eventBus: EventBus) {}

  /**
   * Führt einen neuen Befehl aus und legt ihn auf den Undo-Stack.
   * Löscht den Redo-Stack, da eine neue Aktion einen neuen Zeitstrang erzeugt.
   */
  public execute(command: ICommand): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.notifySystem();
  }

  public undo(): void {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
      this.notifySystem();
    }
  }

  public redo(): void {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.undoStack.push(command);
      this.notifySystem();
    }
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifySystem();
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private notifySystem(): void {
    this.eventBus.emit("history:changed", {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
    });

    this.eventBus.emit("play:updated", undefined);
  }
}
