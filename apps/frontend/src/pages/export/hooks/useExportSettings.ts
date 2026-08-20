import { create } from "zustand";
import type { PDFExportOptions, ExportPreset } from "../../../types/interface";

export const DEFAULT_PRESETS: ExportPreset[] = [
  {
    id: "a4_landscape_2x3",
    name: "DIN A4 Querformat (2x3 Grid)",
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
  },
  {
    id: "wristband_1x3",
    name: "Wristband Coach (1x3)",
    options: {
      pageWidth: 120,
      pageHeight: 60,
      columns: 3,
      rows: 1,
      margin: { top: 5, right: 5, bottom: 5, left: 5 },
      gap: 3,
      playbookTitle: "Redzone Plays",
      routeStrokeWidth: 1.5,
      showLabels: false,
      fontSize: 8,
    },
  },
  {
    id: "wristband_Paul",
    name: "Wristband Coach",
    options: {
      pageWidth: 135,
      pageHeight: 80,
      columns: 4,
      rows: 3,
      margin: { top: 8, right: 12, bottom: 5, left: 12 },
      gap: 0,
      playbookTitle: "Redzone Plays",
      routeStrokeWidth: 1.5,
      showLabels: false,
      fontSize: 8,
    },
  },
];

interface ExportStore {
  selectedPresetId: string;
  options: PDFExportOptions;
  selectedPlayIds: string[];

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
  selectedPresetId: "a4_landscape_2x3",
  options: DEFAULT_PRESETS[0].options,
  selectedPlayIds: [],

  applyPreset: (presetId) =>
    set(() => {
      const preset = DEFAULT_PRESETS.find((p) => p.id === presetId);
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
