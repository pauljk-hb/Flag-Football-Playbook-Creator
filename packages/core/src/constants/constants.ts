export const SYSTEM = {
  DATA_VERSION: 1,
} as const;

export const CANVAS = {
  WIDTH: 800,
  HEIGHT: 600,
  SNAP_THRESHOLD: 20,
  BACKGROUND_COLOR: "#f8fafc",
  HANDLE_RADIUS: 6,
  HANDLE_COLOR: "#ffd147",
} as const;

export const Z_INDEX = {
  FIELD: 10,
  ROUTE: 20,
  PLAYER: 30,
  NODE: 40,
  UI_CONTROLS: 50,
} as const;

export const FOOTBALL_METRICS = {
  PIXELS_PER_YARD: 25,
  DEFAULT_LOS_Y: 400,
} as const;
