import type { PlaybookEventMap } from "./types/EventTypes";

type EventReceiver<T extends keyof PlaybookEventMap> = (
  payload: PlaybookEventMap[T],
) => void;

export class EventBus {
  private listeners: {
    [K in keyof PlaybookEventMap]?: EventReceiver<K>[];
  } = {};

  /**
   * Abonniert ein Event.
   */
  public on<T extends keyof PlaybookEventMap>(
    event: T,
    callback: EventReceiver<T>,
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [] as any;
    }

    (this.listeners[event] as EventReceiver<T>[]).push(callback);
  }

  /**
   * Entfernt ein Abonnement.
   */
  public off<T extends keyof PlaybookEventMap>(
    event: T,
    callback: EventReceiver<T>,
  ): void {
    if (!this.listeners[event]) return;

    const currentListeners = this.listeners[event] as EventReceiver<T>[];

    this.listeners[event] = currentListeners.filter(
      (cb) => cb !== callback,
    ) as any;
  }

  /**
   * Feuert ein Event ab und zwingt dich typsicher den passenden Payload zu übergeben.
   */
  public emit<T extends keyof PlaybookEventMap>(
    event: T,
    payload: PlaybookEventMap[T],
  ): void {
    if (!this.listeners[event]) return;

    const currentListeners = this.listeners[event] as EventReceiver<T>[];

    currentListeners.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error(
          `Error in EventBus while executing listener for event: ${String(event)}`,
          error,
        );
      }
    });
  }

  /**
   * Nützlich beim Laden eines komplett neuen Plays, um Memory-Leaks zu verhindern.
   */
  public clearAllListeners(): void {
    this.listeners = {};
  }
}
