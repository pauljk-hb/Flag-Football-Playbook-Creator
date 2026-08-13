import { Request, Response } from "express";
import { PlaybookService } from "./playbook.service.js";

export const PlaybookController = {
  async getPlaybooks(req: Request, res: Response) {
    try {
      const userId = res.locals.user.id;
      const playbooks = await PlaybookService.getPlaybooksByUserId(userId);

      res.json(playbooks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Fehler beim Laden der Playbooks" });
    }
  },

  async createPlaybook(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const userId = res.locals.user.id;

      if (!name) {
        return res.status(400).json({ error: "Name ist erforderlich" });
      }

      const playbook = await PlaybookService.createPlaybook({
        name,
        description,
        userId,
      });

      res.status(201).json(playbook);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Fehler beim Erstellen des Playbooks" });
    }
  },

  async updatePlaybook(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, description } = req.body;
      const userId = res.locals.user.id;

      if (!id) {
        return res.status(400).json({ error: "ID ist erforderlich" });
      }

      const updatedPlaybook = await PlaybookService.updatePlaybook(id, userId, {
        name,
        description,
      });
      res.json(updatedPlaybook);
    } catch (error: any) {
      console.error(error);
      res
        .status(403)
        .json({ error: error.message || "Fehler beim Aktualisieren." });
    }
  },

  async deletePlaybook(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;

      await PlaybookService.deletePlaybook(id, userId);
      res.json({ message: "Playbook erfolgreich gelöscht." });
    } catch (error: any) {
      console.error(error);
      res.status(403).json({ error: error.message || "Fehler beim Löschen." });
    }
  },

  async updateLastOpened(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = res.locals.user.id;

      const updatedUser = await PlaybookService.updateLastOpend(id, userId);
      res.json({ success: true, lastPlaybookId: updatedUser.id });
    } catch (error: any) {
      console.error("Fehler beim Setzen des letzten Playbooks:", error);
      res.status(500).json({ error: error.message });
    }
  },
};
