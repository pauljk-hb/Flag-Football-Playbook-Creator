import { prisma } from "../../lib/prisma.js";

export const ExportPresetService = {
  async getExportPresets(userId: string) {
    return await prisma.exportPreset.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async createExportPreset(userId: string, data: any) {
    return await prisma.exportPreset.create({
      data: {
        userId,
        name: data.name,
        pageWidth: data.pageWidth,
        pageHeight: data.pageHeight,
        columns: data.columns,
        rows: data.rows,
        gap: data.gap,
        marginTop: data.margin?.top ?? data.marginTop, // Unterstützt verschachtelt und flach
        marginRight: data.margin?.right ?? data.marginRight,
        marginBottom: data.margin?.bottom ?? data.marginBottom,
        marginLeft: data.margin?.left ?? data.marginLeft,
        routeStrokeWidth: data.routeStrokeWidth,
        showLabels: data.showLabels,
      },
    });
  },

  async updateExportPreset(id: string, userId: string, data: any) {
    const existingPreset = await prisma.exportPreset.findFirst({
      where: { id, userId },
    });

    if (!existingPreset) {
      throw new Error("Keine Berechtigung oder Preset nicht gefunden.");
    }

    const updateData = { ...data };
    if (data.margin) {
      updateData.marginTop = data.margin.top;
      updateData.marginRight = data.margin.right;
      updateData.marginBottom = data.margin.bottom;
      updateData.marginLeft = data.margin.left;
      delete updateData.margin; // Das verschachtelte Objekt aus dem Update entfernen
    }

    return await prisma.exportPreset.update({
      where: { id },
      data: updateData,
    });
  },

  async deleteExportPreset(id: string, userId: string) {
    const existingPreset = await prisma.exportPreset.findFirst({
      where: { id, userId },
    });

    if (!existingPreset) {
      throw new Error("Keine Berechtigung oder Preset nicht gefunden.");
    }

    return await prisma.exportPreset.delete({
      where: { id },
    });
  },
};
