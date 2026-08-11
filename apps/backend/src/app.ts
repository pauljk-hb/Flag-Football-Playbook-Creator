import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import "dotenv/config";
import { playbookRouter } from "./modules/playbooks/playbook.routes";
import { playRouter } from "./modules/plays/play.routes";
import { tagRouter } from "./modules/tags/tag.routes";

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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Playbook API Backend läuft!" });
});
