import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { TagController } from "./tag.controller.js";

export const tagRouter = Router();

tagRouter.use(requireAuth);

tagRouter.get("/playbook/:playbookId", TagController.getTags);
tagRouter.post("/playbook/:playbookId/play/:playId", TagController.createTag);

tagRouter.put("/:id", TagController.updateTag);
tagRouter.delete("/:id", TagController.deleteTag);
