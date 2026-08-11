import { prisma } from "../../lib/prisma";

export const TagService = {
  async getTags(playbookId: string, userId: string) {
    const existingPlaybook = await prisma.playbook.findFirst({
      where: { id: playbookId, userId },
    });

    if (!existingPlaybook)
      throw new Error("Keine Berechtigung für dieses Playbook.");

    return await prisma.tag.findMany({
      where: { playbookId },
      orderBy: { name: "asc" },
    });
  },

  async createTagAndAttachToPlay(
    playbookId: string,
    playId: string,
    userId: string,
    data: { name: string; color?: string },
  ) {
    const existingPlaybook = await prisma.playbook.findFirst({
      where: { id: playbookId, userId },
    });

    if (!existingPlaybook)
      throw new Error("Keine Berechtigung für dieses Playbook.");

    return await prisma.tag.create({
      data: {
        playbookId,
        name: data.name,
        color: data.color ?? null,
        plays: {
          connect: { id: playId },
        },
      },
    });
  },

  async updateTag(
    id: string,
    userId: string,
    data: { name?: string; color?: string },
  ) {
    const existing = await prisma.tag.findFirst({
      where: { id, playbook: { userId } },
    });

    if (!existing)
      throw new Error("Tag nicht gefunden oder keine Berechtigung.");

    return await prisma.tag.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.color !== undefined && { color: data.color ?? null }),
      },
    });
  },

  async deleteTag(id: string, userId: string) {
    const existing = await prisma.tag.findFirst({
      where: { id, playbook: { userId } },
    });

    if (!existing)
      throw new Error("Tag nicht gefunden oder keine Berechtigung.");

    return await prisma.tag.delete({
      where: { id },
    });
  },
};
