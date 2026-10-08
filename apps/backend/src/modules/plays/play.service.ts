import { cleanCanvasDataForStorage } from "../../lib/canvasHydration.js";
import { prisma } from "../../lib/prisma.js";
import { CURRENT_PLAY_VERSION, playMigrator } from "../../migrations/index.js";

export const PlayService = {
  async getPlays(playbookId: string, userId: string) {
    const existingPlaybook = await prisma.playbook.findFirst({
      where: { id: playbookId, userId },
    });

    if (!existingPlaybook)
      throw new Error("Keine Berechtigung für dieses Playbook.");

    const plays = await prisma.play.findMany({
      where: { playbookId },
      orderBy: { sortOrder: "asc" },
      include: { tags: true },
    });

    const processedPlays = plays.map((play) => {
      return processPlayData(play);
    });

    return processedPlays;
  },

  async getPlayById(id: string, userId: string) {
    let play = await prisma.play.findFirst({
      where: { id, playbook: { userId } },
      include: { tags: true },
    });

    if (!play) throw new Error("Play nicht gefunden oder keine Berechtigung.");

    play = processPlayData(play);

    return play;
  },

  async createPlay(
    playbookId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      canvasData?: string | null;
      thumbnail?: string;
      sortOrder?: number;
    },
  ) {
    const existingPlaybook = await prisma.playbook.findFirst({
      where: { id: playbookId, userId },
    });
    if (!existingPlaybook)
      throw new Error("Keine Berechtigung für dieses Playbook.");

    return await prisma.play.create({
      data: {
        playbookId,
        name: data.name,
        description: data.description ?? null,
        canvasData: cleanCanvasDataForStorage(data.canvasData) ?? null,
        thumbnail: data.thumbnail ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  },

  async updatePlay(
    id: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      canvasData?: string;
      thumbnail?: string;
      sortOrder?: number;
    },
  ) {
    const existing = await prisma.play.findFirst({
      where: { id, playbook: { userId } },
    });
    if (!existing)
      throw new Error("Play nicht gefunden oder keine Berechtigung.");

    return await prisma.play.update({
      where: { id },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
        ...(data.canvasData !== undefined && {
          canvasData: cleanCanvasDataForStorage(data.canvasData) ?? null,
        }),
        ...(data.thumbnail !== undefined && {
          thumbnail: data.thumbnail ?? null,
        }),
        ...(data.sortOrder !== undefined && {
          sortOrder: data.sortOrder,
        }),
      },
    });
  },

  async deletePlay(id: string, userId: string) {
    const existing = await prisma.play.findFirst({
      where: { id, playbook: { userId } },
    });
    if (!existing)
      throw new Error("Play nicht gefunden oder keine Berechtigung.");

    return await prisma.play.delete({
      where: { id },
    });
  },

  async addTagToPlay(playId: string, tagId: string, userId: string) {
    const existingPlay = await prisma.play.findFirst({
      where: { id: playId, playbook: { userId } },
    });

    if (!existingPlay)
      throw new Error("Play nicht gefunden oder keine Berechtigung.");

    return await prisma.play.update({
      where: { id: playId },
      data: {
        tags: { connect: { id: tagId } },
      },
      include: { tags: true },
    });
  },

  async removeTagFromPlay(playId: string, tagId: string, userId: string) {
    const existingPlay = await prisma.play.findFirst({
      where: { id: playId, playbook: { userId } },
    });

    if (!existingPlay)
      throw new Error("Play nicht gefunden oder keine Berechtigung.");

    return await prisma.play.update({
      where: { id: playId },
      data: {
        tags: { disconnect: { id: tagId } },
      },
      include: { tags: true },
    });
  },
};

function processPlayData(dbPlay: any) {
  if (!dbPlay.canvasData) return dbPlay;

  const parsedData = JSON.parse(dbPlay.canvasData);

  if (parsedData.version === CURRENT_PLAY_VERSION) {
    return dbPlay;
  }

  const result = playMigrator.run(parsedData);

  if (result.wasMigrated) {
    prisma.play
      .update({
        where: { id: dbPlay.id },
        data: { canvasData: JSON.stringify(result.data) },
      })
      .catch((err) =>
        console.error(`Auto-Migration failed für Play ${dbPlay.id}:`, err),
      );
  }

  return {
    ...dbPlay,
    canvasData: JSON.stringify(result.data),
  };
}
