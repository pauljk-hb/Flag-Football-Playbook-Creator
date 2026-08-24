import { prisma } from "../../lib/prisma.js";

export const PlayerStylePresetService = {
  async verifyPlaybookOwnership(playbookId: string, userId: string) {
    const playbook = await prisma.playbook.findFirst({
      where: { id: playbookId, userId },
    });
    if (!playbook) throw new Error("Keine Berechtigung für dieses Playbook.");
  },

  async getPresets(playbookId: string, userId: string) {
    await this.verifyPlaybookOwnership(playbookId, userId);

    return await prisma.playerStylePreset.findMany({
      where: { playbookId },
      orderBy: { label: "asc" },
    });
  },

  async upsertPreset(playbookId: string, userId: string, data: any) {
    await this.verifyPlaybookOwnership(playbookId, userId);

    return await prisma.playerStylePreset.upsert({
      where: {
        playbookId_playerId: {
          playbookId: playbookId,
          playerId: data.playerId,
        },
      },
      update: {
        label: data.label,
        color: data.color,
        shape: data.shape,
        showLabels: data.showLabels,
      },
      create: {
        playbookId,
        playerId: data.playerId,
        label: data.label,
        color: data.color,
        shape: data.shape,
        showLabels: data.showLabels,
      },
    });
  },

  async deletePreset(id: string, playbookId: string, userId: string) {
    await this.verifyPlaybookOwnership(playbookId, userId);

    return await prisma.playerStylePreset.delete({
      where: { id },
    });
  },
};
