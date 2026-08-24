import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { PlayerStylePresetController } from "./playerStylePreset.controller.js";

export const playerStylePresetRouter = Router();

playerStylePresetRouter.use(requireAuth);

playerStylePresetRouter.get(
  "/playbook/:playbookId",
  PlayerStylePresetController.getPresets,
);
playerStylePresetRouter.post(
  "/playbook/:playbookId",
  PlayerStylePresetController.savePreset,
);
playerStylePresetRouter.delete(
  "/playbook/:playbookId/:id",
  PlayerStylePresetController.deletePreset,
);
