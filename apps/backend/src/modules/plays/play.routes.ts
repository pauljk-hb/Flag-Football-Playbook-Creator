import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { PlayController } from "./play.controller.js";

export const playRouter = Router();

playRouter.use(requireAuth);

playRouter.get("/playbook/:playbookId", PlayController.getPlays);
playRouter.post("/playbook/:playbookId", PlayController.createPlay);

playRouter.get("/:id", PlayController.getPlayById);
playRouter.put("/:id", PlayController.updatePlay);
playRouter.delete("/:id", PlayController.deletePlay);
playRouter.post("/:id/tags", PlayController.addTag);
playRouter.delete("/:id/tags/:tagId", PlayController.removeTag);
