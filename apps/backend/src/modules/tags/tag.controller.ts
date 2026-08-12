import { Request, Response } from "express";
import { TagService } from "./tag.service.js";

export const TagController = {
  async getTags(req: Request, res: Response) {
    try {
      const playbookId = req.params.playbookId as string;
      const userId = res.locals.user.id;

      const tags = await TagService.getTags(playbookId, userId);
      res.json(tags);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async createTag(req: Request, res: Response) {
    try {
      const playbookId = req.params.playbookId as string;
      const playId = req.params.playId as string;

      const userId = res.locals.user.id;
      const { name, color } = req.body;

      if (!name) {
        res
          .status(400)
          .json({ error: "Ein Name für den Tag ist erforderlich." });
        return;
      }

      const tag = await TagService.createTagAndAttachToPlay(
        playbookId,
        playId,
        userId,
        {
          name,
          color,
        },
      );
      res.status(201).json(tag);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async updateTag(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;
      const { name, color } = req.body;

      const updatedTag = await TagService.updateTag(id, userId, {
        name,
        color,
      });
      res.json(updatedTag);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async deleteTag(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;

      await TagService.deleteTag(id, userId);
      res.json({ message: "Tag erfolgreich gelöscht." });
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },
};
