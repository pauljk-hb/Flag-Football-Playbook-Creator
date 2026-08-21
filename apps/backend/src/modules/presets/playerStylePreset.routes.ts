import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { PlayerStylePresetController } from "./playerStylePreset.controller";

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
