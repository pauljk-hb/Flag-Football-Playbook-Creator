import { Request, Response } from "express";
import { PlayService } from "./play.service";

export const PlayController = {
  async getPlays(req: Request, res: Response) {
    try {
      const playbookId = req.params.playbookId as string;
      const userId = res.locals.user.id;

      const plays = await PlayService.getPlays(playbookId, userId);
      res.json(plays);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async getPlayById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;

      const play = await PlayService.getPlayById(id, userId);
      res.json(play);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async createPlay(req: Request, res: Response) {
    try {
      const playbookId = req.params.playbookId as string;
      const userId = res.locals.user.id;
      let { name, description, canvasData, thumbnail, sortOrder } = req.body;

      if (!name) {
        name = "Unbenanntes Play";
      }

      const play = await PlayService.createPlay(playbookId, userId, {
        name,
        description,
        canvasData,
        thumbnail,
        sortOrder,
      });
      res.status(201).json(play);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async updatePlay(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;
      const { name, description, canvasData, thumbnail, sortOrder } = req.body;

      const updatedPlay = await PlayService.updatePlay(id, userId, {
        name,
        description,
        canvasData,
        thumbnail,
        sortOrder,
      });
      res.json(updatedPlay);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async deletePlay(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;

      await PlayService.deletePlay(id, userId);
      res.json({ message: "Spielzug erfolgreich gelöscht." });
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async addTag(req: Request, res: Response) {
    try {
      const playId = req.params.id as string;
      const { tagId } = req.body;
      const userId = res.locals.user.id;

      if (!tagId) {
        res.status(400).json({ error: "tagId ist erforderlich." });
        return;
      }

      const updatedPlay = await PlayService.addTagToPlay(playId, tagId, userId);
      res.json(updatedPlay);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },

  async removeTag(req: Request, res: Response) {
    try {
      const playId = req.params.id as string;
      const tagId = req.params.tagId as string;
      const userId = res.locals.user.id;

      const updatedPlay = await PlayService.removeTagFromPlay(
        playId,
        tagId,
        userId,
      );
      res.json(updatedPlay);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  },
};
