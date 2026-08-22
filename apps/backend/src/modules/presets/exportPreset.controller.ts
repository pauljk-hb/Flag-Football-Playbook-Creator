import { Request, Response } from "express";
import { ExportPresetService } from "./exportPreset.service";

export const ExportPresetController = {
  async getExportPresets(req: Request, res: Response) {
    try {
      const userId = res.locals.user.id;
      const presets = await ExportPresetService.getExportPresets(userId);
      res.json(presets);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async createExportPreset(req: Request, res: Response) {
    try {
      const userId = res.locals.user.id;
      const newPreset = await ExportPresetService.createExportPreset(
        userId,
        req.body,
      );
      res.status(201).json(newPreset);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async updateExportPreset(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;
      const updatedPreset = await ExportPresetService.updateExportPreset(
        id,
        userId,
        req.body,
      );
      res.json(updatedPreset);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async deleteExportPreset(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;
      await ExportPresetService.deleteExportPreset(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },
};
