import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { auth } from "./lib/auth.js";
import { playbookRouter } from "./modules/playbooks/playbook.routes.js";
import { playRouter } from "./modules/plays/play.routes.js";
import { exportPresetRouter } from "./modules/presets/exportPreset.routes.js";
import { playerStylePresetRouter } from "./modules/presets/playerStylePreset.routes.js";
import { tagRouter } from "./modules/tags/tag.routes.js";

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/playbooks", playbookRouter);
app.use("/api/v1/plays", playRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/presets/export", exportPresetRouter);
app.use("/api/v1/presets/player-styles", playerStylePresetRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Playbook API Backend läuft!" });
});
