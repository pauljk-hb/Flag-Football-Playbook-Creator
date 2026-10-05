import type { EntityType } from "@/types/system";
import "fabric";

declare module "fabric" {
  interface Object {
    entityId?: string;
    entityType?: EntityType;
    parentId?: string;
    isRouteHandle?: boolean;
  }
}
