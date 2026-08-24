import { Request, Response } from "express";
import { PlayerStylePresetService } from "./playerStylePreset.service.js";

export const PlayerStylePresetController = {
  async getPresets(req: Request, res: Response) {
    try {
      const playbookId = req.params.playbookId as string;
      const userId = res.locals.user.id;
      const presets = await PlayerStylePresetService.getPresets(
        playbookId,
        userId,
      );
      res.json(presets);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async savePreset(req: Request, res: Response) {
    try {
      const playbookId = req.params.playbookId as string;
      const userId = res.locals.user.id;
      const savedPreset = await PlayerStylePresetService.upsertPreset(
        playbookId,
        userId,
        req.body,
      );
      res.status(200).json(savedPreset);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async deletePreset(req: Request, res: Response) {
    try {
      const playbookId = req.params.playbookId as string;
      const id = req.params.id as string;
      const userId = res.locals.user.id;
      await PlayerStylePresetService.deletePreset(id, playbookId, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },
};
