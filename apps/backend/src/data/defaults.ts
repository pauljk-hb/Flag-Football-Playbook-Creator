export const DEFAULT_TAGS = [
  { name: "Short Yard", color: "#3b82f6" },
  { name: "Long Yard", color: "#22c55e" },
  { name: "Redzone", color: "#ef4444" },
];

export const getDefaultExportPresets = (userId: string) => [
  {
    userId,
    name: "A4 Hochkant (6 Spielzüge)",
    pageWidth: 210,
    pageHeight: 297,
    columns: 2,
    rows: 3,
    gap: 10,
    marginTop: 15,
    marginRight: 15,
    marginBottom: 15,
    marginLeft: 15,
    routeStrokeWidth: 2,
    showLabels: true,
  },
  {
    userId,
    name: "A4 Querformat (Groß)",
    pageWidth: 297,
    pageHeight: 210,
    columns: 2,
    rows: 1,
    gap: 15,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 20,
    routeStrokeWidth: 3,
    showLabels: false,
  },
];

export const getDefaultPlayerStyles = (playbookId: string) => [
  {
    playbookId,
    playerId: "QB",
    label: "QB",
    color: "#1a1b1b",
    shape: "circle",
  },
  {
    playbookId,
    playerId: "CENTER",
    label: "C",
    color: "#469b54",
    shape: "square",
  },
  {
    playbookId,
    playerId: "WR1",
    label: "X",
    color: "#326FB5",
    shape: "circle",
  },
  {
    playbookId,
    playerId: "WR2",
    label: "Z",
    color: "#3399B5",
    shape: "circle",
  },
  {
    playbookId,
    playerId: "RED",
    label: "R",
    color: "#E63D38",
    shape: "circle",
  },
];
