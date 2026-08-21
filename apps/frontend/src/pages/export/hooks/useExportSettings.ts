import { api } from "@/api/client";
import { create } from "zustand";
import type { ExportPreset, PDFExportOptions } from "../../../types/interface";

export interface DBPreset {
  id: string;
  name: string;
  pageWidth: number;
  pageHeight: number;
  columns: number;
  rows: number;
  gap?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  routeStrokeWidth?: number;
  showLabels?: boolean;
  fontSize?: number;
  playbookTitle?: string;
}

function mapDBPresetToFrontend(dbPreset: DBPreset): ExportPreset {
  return {
    id: dbPreset.id,
    name: dbPreset.name,
    options: {
      pageWidth: dbPreset.pageWidth,
      pageHeight: dbPreset.pageHeight,
      columns: dbPreset.columns,
      rows: dbPreset.rows,
      gap: dbPreset.gap ?? 0,
      margin: {
        top: dbPreset.marginTop ?? 10,
        right: dbPreset.marginRight ?? 10,
        bottom: dbPreset.marginBottom ?? 10,
        left: dbPreset.marginLeft ?? 10,
      },
      routeStrokeWidth: dbPreset.routeStrokeWidth ?? 2,
      showLabels: dbPreset.showLabels ?? true,
      fontSize: dbPreset.fontSize ?? 12,
      playbookTitle: dbPreset.playbookTitle || "",
    },
  };
}

const FALLBACK_PRESET: ExportPreset = {
  id: "fallback_a4",
  name: "DIN A4 Querformat (Standard)",
  options: {
    pageWidth: 297,
    pageHeight: 210,
    columns: 3,
    rows: 2,
    margin: { top: 15, right: 15, bottom: 15, left: 15 },
    gap: 8,
    playbookTitle: "Offense Playbook",
    routeStrokeWidth: 2,
    showLabels: true,
    fontSize: 12,
  },
};

interface ExportStore {
  presets: ExportPreset[];
  selectedPresetId: string;
  options: PDFExportOptions;
  selectedPlayIds: string[];

  fetchPresets: () => Promise<void>;
  applyPreset: (presetId: string) => void;
  updateOption: <K extends keyof PDFExportOptions>(
    key: K,
    value: PDFExportOptions[K],
  ) => void;
  updateMargin: (side: keyof PDFExportOptions["margin"], val: number) => void;
  setSelectedPlayIds: (
    idsOrUpdater: string[] | ((prev: string[]) => string[]),
  ) => void;
  removePlayId: (id: string) => void;
}

export const useExportSettings = create<ExportStore>((set) => ({
  presets: [],
  selectedPresetId: "",
  options: FALLBACK_PRESET.options,
  selectedPlayIds: [],

  fetchPresets: async () => {
    try {
      const dbPresets =
        (await api.presets.export.getAll()) as unknown as DBPreset[];

      const loadedPresets: ExportPreset[] =
        dbPresets && dbPresets.length > 0
          ? dbPresets.map(mapDBPresetToFrontend)
          : [FALLBACK_PRESET];

      set((state) => {
        const currentId = state.selectedPresetId;
        const presetExists = loadedPresets.some((p) => p.id === currentId);

        const presetToApply = presetExists
          ? loadedPresets.find((p) => p.id === currentId)!
          : loadedPresets[0];

        return {
          presets: loadedPresets,
          selectedPresetId: presetToApply.id,
          options: presetExists ? state.options : { ...presetToApply.options },
        };
      });
    } catch (error) {
      console.error("Fehler beim Laden der Export-Presets:", error);
      set({ presets: [FALLBACK_PRESET], selectedPresetId: FALLBACK_PRESET.id });
    }
  },

  applyPreset: (presetId) =>
    set((state) => {
      const preset = state.presets.find((p) => p.id === presetId);
      if (preset) {
        return {
          selectedPresetId: presetId,
          options: { ...preset.options },
        };
      }
      return { selectedPresetId: presetId };
    }),

  updateOption: (key, value) =>
    set((state) => ({
      options: { ...state.options, [key]: value },
    })),

  updateMargin: (side, val) =>
    set((state) => ({
      options: {
        ...state.options,
        margin: { ...state.options.margin, [side]: val },
      },
    })),

  setSelectedPlayIds: (idsOrUpdater) =>
    set((state) => ({
      selectedPlayIds:
        typeof idsOrUpdater === "function"
          ? idsOrUpdater(state.selectedPlayIds)
          : idsOrUpdater,
    })),

  removePlayId: (id) =>
    set((state) => ({
      selectedPlayIds: state.selectedPlayIds.filter((pId) => pId !== id),
    })),
}));
