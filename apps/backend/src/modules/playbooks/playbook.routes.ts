import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { PlaybookController } from "./playbook.controller.js";

export const playbookRouter = Router();

playbookRouter.use(requireAuth);

playbookRouter.get("/", PlaybookController.getPlaybooks);
playbookRouter.post("/", PlaybookController.createPlaybook);
playbookRouter.put("/:id", PlaybookController.updatePlaybook);
playbookRouter.delete("/:id", PlaybookController.deletePlaybook);
playbookRouter.put("/:id/active", PlaybookController.updateLastOpened);
