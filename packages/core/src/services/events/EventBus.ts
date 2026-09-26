// Hilfstyp für die Callbacks
type EventReceiver<T extends keyof PlaybookEventMap> = (
  payload: PlaybookEventMap[T],
) => void;

export class EventBus {
  // Speichert Arrays von Callbacks pro Event-Name
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
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  /**
   * Entfernt ein Abonnement.
   */
  public off<T extends keyof PlaybookEventMap>(
    event: T,
    callback: EventReceiver<T>,
  ): void {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event]!.filter(
      (cb) => cb !== callback,
    );
  }

  /**
   * Feuert ein Event ab und zwingt dich typsicher den passenden Payload zu übergeben.
   */
  public emit<T extends keyof PlaybookEventMap>(
    event: T,
    payload: PlaybookEventMap[T],
  ): void {
    if (!this.listeners[event]) return;

    this.listeners[event]!.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error(
          `Error in EventBus while executing listener for event: ${event}`,
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
