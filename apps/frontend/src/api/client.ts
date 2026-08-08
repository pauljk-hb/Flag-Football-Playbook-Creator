import type { Play, PlayDTO } from "@/types/interface";

const STORAGE_PREFIX = "play_";

export const api = {
  plays: {
    getAll: async (): Promise<Play[]> => {
      const plays: Play[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Nutze den Prefix oder filtere nach deinen Keys
        if (key && (key.startsWith(STORAGE_PREFIX) || key.startsWith("Play"))) {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            try {
              const parsedPlay = JSON.parse(rawData) as Play;
              plays.push(parsedPlay);
            } catch (error) {
              console.error(`Fehler beim Parsen von Key "${key}":`, error);
            }
          }
        }
      }

      return plays;
    },

    getById: async (id: string): Promise<Play | null> => {
      const rawData =
        localStorage.getItem(`${STORAGE_PREFIX}${id}`) ||
        localStorage.getItem(id);

      if (!rawData) {
        return null;
      }

      try {
        const play = JSON.parse(rawData) as Play;
        return play;
      } catch (error) {
        console.error(`Fehler beim Parsen des Plays mit ID "${id}":`, error);
        return null;
      }
    },

    create: async (): Promise<string> => {
      const id: string = crypto.randomUUID();
      const key = `${STORAGE_PREFIX}${id}`;
      const now = new Date().toISOString();

      const fullPlay: Play = {
        id,
        title: "Unbenanntes Play",
        description: "",
        thumbnail: "",
        data: null,
        createdAt: now,
        updatedAt: now,
      };

      localStorage.setItem(key, JSON.stringify(fullPlay));
      return id;
    },

    update: async (id: string, play: PlayDTO): Promise<void> => {
      const key = `${STORAGE_PREFIX}${id}`;
      const now = new Date().toISOString();

      let createdAt = now;
      const existingRaw = localStorage.getItem(key);
      if (existingRaw) {
        try {
          const existingPlay = JSON.parse(existingRaw);
          if (existingPlay.createdAt) {
            createdAt = existingPlay.createdAt;
          }
        } catch {
          // Fallback auf 'now' falls Parse fehlschlägt
        }
      }

      const updatedPlay: Play = {
        id,
        title: play.title || "Unbenanntes Play",
        description: play.description || "",
        thumbnail: play.thumbnail,
        data: typeof play.data === "string" ? JSON.parse(play.data) : play.data,
        createdAt,
        updatedAt: now,
      };

      localStorage.setItem(key, JSON.stringify(updatedPlay));
    },

    delete: async (id: string): Promise<boolean> => {
      const key = `${STORAGE_PREFIX}${id}`;
      localStorage.removeItem(key);
      return true;
    },
  },
};
