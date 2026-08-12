import { prisma } from "../../lib/prisma.js";

export const PlaybookService = {
  async getPlaybooksByUserId(userId: string) {
    return await prisma.playbook.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async createPlaybook(data: {
    name: string;
    description?: string;
    userId: string;
  }) {
    return await prisma.playbook.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        userId: data.userId,
      },
    });
  },

  async updatePlaybook(
    id: string,
    userId: string,
    data: { name?: string; description?: string },
  ) {
    const existing = await prisma.playbook.findFirst({ where: { id, userId } });
    if (!existing)
      throw new Error("Playbook nicht gefunden oder keine Berechtigung.");

    return await prisma.playbook.update({
      where: { id },
      data,
    });
  },

  async deletePlaybook(id: string, userId: string) {
    const existing = await prisma.playbook.findFirst({ where: { id, userId } });
    if (!existing)
      throw new Error("Playbook nicht gefunden oder keine Berechtigung.");

    return await prisma.playbook.delete({
      where: { id },
    });
  },
};
