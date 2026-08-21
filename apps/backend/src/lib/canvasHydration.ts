const APP_DEFAULT_STYLES: any = {
  QB: { label: "QB", color: "#1a1b1b", shape: "circle" },
  CENTER: { label: "C", color: "#469b54", shape: "square" },
  WR1: { label: "X", color: "#326FB5", shape: "circle" },
  WR2: { label: "Z", color: "#3399B5", shape: "circle" },
  RED: { label: "R", color: "#E63D38", shape: "circle" },
  default: { label: "QB", color: "#1a1b1b", shape: "circle" },
};

/**
 * Mischt die Datenbank-CanvasData mit den Presets des Playbooks zusammen.
 * Erstellt das fertige `style`-Objekt für das Frontend.
 */
export function hydrateCanvasData(canvasData: string | null, presets: any[]) {
  if (!canvasData) return canvasData;

  try {
    const parsedData = JSON.parse(canvasData);
    if (!parsedData.players || !Array.isArray(parsedData.players))
      return canvasData;

    const presetMap = new Map(presets.map((p) => [p.playerId, p]));

    parsedData.players = parsedData.players.map((player: any) => {
      const typeId = player.role || "default";

      const baseStyle =
        APP_DEFAULT_STYLES[typeId] || APP_DEFAULT_STYLES.default;
      const globalStyle = presetMap.get(typeId) || {};
      const overrideStyle = player.styleOverride || {};

      player.style = {
        color: overrideStyle.color ?? globalStyle.color ?? baseStyle.color,
        shape: overrideStyle.shape ?? globalStyle.shape ?? baseStyle.shape,
        label:
          overrideStyle.label ?? globalStyle.label ?? baseStyle.label ?? typeId,
        showLabels:
          overrideStyle.showLabels ??
          globalStyle.showLabels ??
          baseStyle.showLabels,
      };

      return player;
    });

    return JSON.stringify(parsedData);
  } catch (error) {
    console.error("Fehler beim Parsen der Canvas-Daten", error);
    return canvasData;
  }
}

/**
 * Entfernt berechnete Felder (`style`) vor dem Speichern in die Datenbank.
 */
export function cleanCanvasDataForStorage(
  canvasData: string | null | undefined,
) {
  if (!canvasData) return canvasData;

  try {
    const parsedData = JSON.parse(canvasData);
    if (parsedData.players && Array.isArray(parsedData.players)) {
      parsedData.players.forEach((player: any) => {
        delete player.style;
      });
    }

    return JSON.stringify(parsedData);
  } catch (error) {
    return canvasData;
  }
}
