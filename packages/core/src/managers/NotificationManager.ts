import type { CoreNotification, LogLevel } from "../types/interfaces";

export class NotificationManager {
  private listeners: ((notification: CoreNotification) => void)[] = [];

  /**
   * Frontend abonniert hier die Nachrichten.
   */
  public subscribe(
    callback: (notification: CoreNotification) => void,
  ): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Core-Klassen nutzen das, um Nachrichten zu senden.
   */
  public sendFeedback(
    level: LogLevel,
    message: string,
    messageKey?: string,
  ): void {
    const notification = { level, message, code: messageKey };
    this.listeners.forEach((listener) => listener(notification));

    if (level === "error") console.error(`[Core Error]:`, message, messageKey);
    if (level === "warning")
      console.warn(`[Core Warning]:`, message, messageKey);
    if (level === "info") console.info(`[Core Info]:`, message, messageKey);
  }
}
