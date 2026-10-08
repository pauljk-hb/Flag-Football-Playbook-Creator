import type { PlayerStyle } from "./domain";

export type PlaybookMode = "EDITOR" | "DRAW" | "READ_ONLY";

export interface PlaybookConfig {
  playbookMode: PlaybookMode;
  themeConfig: ThemeConfig;
}

export interface ThemeConfig {
  playerRoles: Record<string, PlayerStyle>;
}

export interface SelectionItem {
  id: string;
  type: EntityType;
  parentId?: string;
}

export type EntityType = "PLAYER" | "ROUTE" | "NODE";

export type LogLevel = "info" | "success" | "warning" | "error";

export interface CoreNotification {
  level: LogLevel;
  message: string;
  messageKey?: string;
}
