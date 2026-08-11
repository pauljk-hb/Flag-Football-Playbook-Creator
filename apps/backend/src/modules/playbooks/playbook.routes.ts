import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { PlaybookController } from "./playbook.controller";

export const playbookRouter = Router();

playbookRouter.use(requireAuth);

playbookRouter.get("/", PlaybookController.getPlaybooks);
playbookRouter.post("/", PlaybookController.createPlaybook);
playbookRouter.put("/:id", PlaybookController.updatePlaybook);
playbookRouter.delete("/:id", PlaybookController.deletePlaybook);
