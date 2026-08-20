import type {
  PDFExportOptions,
  SelectedPlayItem,
} from "../../../types/interface";
import { usePreview } from "../hooks/usePreview";

export function PagePreview({
  options,
  plays,
}: {
  options: PDFExportOptions;
  plays: SelectedPlayItem[];
}) {
  // Feste Höhe für den Preview-Container (z.B. 240px).
  // Das Blatt Papier skaliert sich über den Hook exakt auf diese Höhe.
  const previewHeight = 190;
  const previewData = usePreview(options, previewHeight);

  const playsPerPage = options.columns * options.rows || 1;
  const firstPagePlays = plays.slice(0, playsPerPage);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <span className="text-xs font-semibold text-muted-foreground w-full text-left mb-2 shrink-0">
        Vorschau: Seite 1 ({options.pageWidth || 0} × {options.pageHeight || 0}{" "}
        mm)
      </span>

      {/* Zentrier-Container */}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        {/* Das "Blatt Papier" - Relative Positionierung, damit die Kinder absolut darin schweben können */}
        <div
          className="bg-white border border-zinc-300 shadow-md relative"
          style={{
            width: `${previewData.paperWidthPx}px`,
            height: `${previewData.paperHeightPx}px`,
          }}
        >
          {/* Playbook Titel (wie im Backend bei renderHeader) */}
          {options.playbookTitle && (
            <div
              className="absolute font-sans font-normal text-[#282828] whitespace-nowrap"
              style={{
                left: `${previewData.titleXPx}px`,
                // - fontSizePx, weil HTML-Text von oben-links gerendert wird, PDF-Text von unten-links (Baseline)
                top: `${previewData.titleYPx - previewData.fontSizePx * 1.5}px`,
                fontSize: `${previewData.fontSizePx * 2.8}px`, // 14pt simuliert (5pt * 2.8 = 14pt)
              }}
            >
              {options.playbookTitle}
            </div>
          )}

          {/* Die berechneten Grid-Zellen rendern */}
          {previewData.gridCells.map((cell, i) => {
            const play = firstPagePlays[i];

            return (
              <div
                key={i}
                className="absolute border border-black bg-white flex flex-col"
                style={{
                  left: `${cell.xPx}px`,
                  top: `${cell.yPx}px`,
                  width: `${cell.widthPx}px`,
                  height: `${cell.heightPx}px`,
                  // Falls kein Play da ist, wird der Rahmen gestrichelt (als Editor-Hilfe)
                  borderStyle: play ? "solid" : "dashed",
                  borderColor: play ? "black" : "#d4d4d8",
                  borderWidth: `${0.3 * previewData.scale}px`, // doc.setLineWidth(0.3)
                }}
              >
                {play ? (
                  <>
                    {/* WICHTIG gegen Verzerrungen: Das Backend erstellt Thumbnails, die 
                        das korrekte Ratio haben. Wir nutzen w-full h-full, damit es die Zelle füllt. */}
                    <img
                      src={play.thumbnail}
                      alt={play.title}
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                    />

                    {/* Titel-Overlay unten links */}
                    {options.showLabels !== false && (
                      <div
                        className="absolute font-sans font-bold italic text-black whitespace-nowrap truncate"
                        style={{
                          left: `${previewData.textPaddingPx}px`,
                          bottom: `${previewData.textPaddingPx}px`,
                          fontSize: `${previewData.fontSizePx}px`,
                          maxWidth: `calc(100% - ${previewData.textPaddingPx * 2}px)`,
                        }}
                      >
                        {play.title}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      style={{ fontSize: `${previewData.fontSizePx * 1.5}px` }}
                      className="text-zinc-300"
                    >
                      Leer
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
