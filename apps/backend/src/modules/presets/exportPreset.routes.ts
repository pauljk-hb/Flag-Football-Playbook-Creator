import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { ExportPresetController } from "./exportPreset.controller";

export const exportPresetRouter = Router();

exportPresetRouter.use(requireAuth);

exportPresetRouter.get("/", ExportPresetController.getExportPresets);
exportPresetRouter.post("/", ExportPresetController.createExportPreset);
exportPresetRouter.put("/:id", ExportPresetController.updateExportPreset);
exportPresetRouter.delete("/:id", ExportPresetController.deleteExportPreset);
