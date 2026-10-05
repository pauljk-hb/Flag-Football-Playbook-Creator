import type { Point2D, RouteNode } from "../../../types/domain";
import type {
  CoreNotification,
  PlaybookMode,
  SelectionItem,
} from "../../../types/system";

export interface PublicPlaybookEventMap {
  "history:changed": { canUndo: boolean; canRedo: boolean };

  "system:notification": CoreNotification;
  "system:mode_changed": PlaybookMode;

  "selection:changed": SelectionItem[];
}

export interface PrivatePlaybookEventMap {
  "player:moved": {
    playerId: string;
    startPosition: Point2D;
    endPosition: Point2D;
  };
  "player:selected": { playerId: string };

  "route:drawn": { playerId: string; nodes: RouteNode[]; routeType: string };
  "route:modified": {
    routeId: string;
    oldNodes: RouteNode[];
    newNodes: RouteNode[];
  };
  "route:selected": { routeId: string };

  "canvas:clicked": { x: number; y: number };
  "selection:cleared": undefined;

  "play:updated": any;
  "play:loaded": any;
}

export type PlaybookEventMap = PublicPlaybookEventMap & PrivatePlaybookEventMap;
