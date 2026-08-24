import {
  DEFAULT_TAGS,
  getDefaultExportPresets,
  getDefaultPlayerStyles,
} from "../../data/defaults.js";
import { prisma } from "../../lib/prisma.js";

export async function setupNewUserWorkspace(userId: string) {
  const firstPlaybook = await prisma.playbook.create({
    data: {
      userId: userId,
      name: "Mein erstes Playbook",
      description: "Standard-Playbook (automatisch generiert)",
      tags: {
        create: DEFAULT_TAGS,
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { lastPlaybookId: firstPlaybook.id },
  });

  await Promise.all([
    prisma.exportPreset.createMany({
      data: getDefaultExportPresets(userId),
    }),
    prisma.playerStylePreset.createMany({
      data: getDefaultPlayerStyles(firstPlaybook.id),
    }),
  ]);
}

export async function ensureUserHasDefaults(userId: string) {
  const playbooks = await prisma.playbook.findMany({
    where: { userId },
  });

  if (playbooks.length === 0) {
    await setupNewUserWorkspace(userId);
    return;
  }

  for (const playbook of playbooks) {
    const presetCount = await prisma.playerStylePreset.count({
      where: { playbookId: playbook.id },
    });

    if (presetCount === 0) {
      console.log(
        `Füge fehlende Player-Presets für Playbook ${playbook.id} hinzu...`,
      );
      await prisma.playerStylePreset.createMany({
        data: getDefaultPlayerStyles(playbook.id),
      });
    }
  }

  const exportPresetCount = await prisma.exportPreset.count({
    where: { userId },
  });

  if (exportPresetCount === 0) {
    console.log(`Füge fehlende Export-Presets für User ${userId} hinzu...`);
    await prisma.exportPreset.createMany({
      data: getDefaultExportPresets(userId),
    });
  }
}
