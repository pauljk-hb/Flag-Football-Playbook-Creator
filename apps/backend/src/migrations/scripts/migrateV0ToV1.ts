import { PlayMigration } from "../MigrationSystem";

const LABEL_TO_ROLE: Record<string, string> = {
  QB: "QB",
  C: "CENTER",
  X: "WR1",
  Z: "WR2",
  R: "RED",
};

export const migrateV0ToV1: PlayMigration = {
  fromVersion: 0,
  toVersion: 1,

  migrate: (oldData: any) => {
    const players = (oldData.players ?? []).map((player: any) => {
      let derivedRoleId: string = "UNKNOWN";
      let isCustomLabel = false;

      if (player.roleId) {
        derivedRoleId = String(player.roleId);
      } else if (player.role) {
        derivedRoleId = String(player.role);
      } else if (player.label) {
        const mappedRole = LABEL_TO_ROLE[player.label];
        if (mappedRole) {
          derivedRoleId = mappedRole;
        } else {
          isCustomLabel = true;
        }
      }

      const hasOverrides =
        player.color || player.label || player.shape || isCustomLabel;

      return {
        id: player.id,
        roleId: derivedRoleId,
        position: {
          x: Number(player.x),
          y: Number(player.y),
        },
        ...(hasOverrides
          ? {
              styleOverride: {
                ...(player.color ? { color: String(player.color) } : {}),
                ...(player.label ? { label: String(player.label) } : {}),
                ...(player.shape ? { shape: player.shape as any } : {}),
                ...(player.label ? { showLabel: true } : {}),
              },
            }
          : {}),
      };
    });

    const routes = (oldData.routes ?? []).map((route: any) => {
      const nodes = (route.nodes ?? []).map((node: any) => {
        const routeNode: any = {
          position: { x: Number(node.x), y: Number(node.y) },
          type: node.type === "CURVE" ? "CURVE" : "STRAIGHT",
        };
        if (node.cpInX !== undefined)
          routeNode.cpIn = { x: Number(node.cpInX), y: Number(node.cpInY) };
        if (node.cpOutX !== undefined)
          routeNode.cpOut = { x: Number(node.cpOutX), y: Number(node.cpOutY) };
        return routeNode;
      });

      return {
        id: route.id,
        playerId: route.playerId,
        routeType: route.routeType ?? "default",
        nodes,
        style: {
          color: route.color ?? "#000000",
          ...(route.thickness && { thickness: route.thickness }),
        },
      };
    });

    return {
      fieldPresetId: oldData.fieldPresetId ?? "STANDARD",
      players,
      routes,
    };
  },
};
