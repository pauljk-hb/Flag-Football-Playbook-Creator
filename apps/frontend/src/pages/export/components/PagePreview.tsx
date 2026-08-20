import type { PDFExportOptions, SelectedPlayItem } from "@/types/interface";

export function PagePreview({
  options,
  plays,
}: {
  options: PDFExportOptions;
  plays: SelectedPlayItem[];
}) {
  // 1. Standardwerte aus dem Backend ExportManager übernehmen, falls nicht gesetzt
  const pageWidth = options.pageWidth ?? 135; // Backend Default
  const pageHeight = options.pageHeight ?? 80; // Backend Default
  const columns = options.columns ?? 4;
  const rows = options.rows ?? 3;
  const margin = options.margin ?? { top: 5, bottom: 8, left: 12, right: 12 };
  const gap = options.gap ?? 0;

  const playsPerPage = columns * rows || 1;
  const firstPagePlays = plays.slice(0, playsPerPage);

  // Seitenverhältnis für das Papier
  const aspectRatio = `${pageWidth} / ${pageHeight}`;

  // 2. Berechnungslogik analog zum Backend calculateGridLayout

  // HeaderHeight ist im Backend hartcodiert auf 0
  const headerHeightMM = 0;

  // Nutzbare Breite/Höhe für das Grid (ohne Ränder)
  const usableWidthMM = pageWidth - (margin.left + margin.right);
  const usableHeightMM =
    pageHeight - (margin.bottom + margin.top) - headerHeightMM;

  // Maße einer einzelnen Zelle in MM berechnen (Gaps werden vom CSS Grid gehandelt)
  // Backend Logik: usableArea = Total - Margins - Sum(Gaps); cell = usableArea / count
  const totalGapsWidthMM = (columns - 1) * gap;
  const totalGapsHeightMM = (rows - 1) * gap;

  const cellWidthMM = (usableWidthMM - totalGapsWidthMM) / columns;
  const cellHeightMM = (usableHeightMM - totalGapsHeightMM) / rows;

  // Umrechnung MM in relative Prozentsätze für CSS (Blatt-Simulation)
  const pTop = (margin.top / pageHeight) * 100;
  const pBottom = (margin.bottom / pageHeight) * 100;
  const pLeft = (margin.left / pageWidth) * 100;
  const pRight = (margin.right / pageWidth) * 100;
  const pHeader = (headerHeightMM / pageHeight) * 100;

  // Gap relativ zur nutzbaren Grid-Fläche berechnen
  const relGapMM = gap;

  // 3. Titel-Overlay Padding analog zum Backend (textPaddingX/Y = 1.5mm)
  const textPaddingX_MM = 1.5;
  const textPaddingY_MM = 1.5;

  // Umrechnung des Titel-Paddings relativ zur Zellengröße in Prozent
  // Backend ref: textX = xPos + 1.5; textY = yPos + cellHeight - 1.5;
  const textLeftPercent = (textPaddingX_MM / cellWidthMM) * 100;
  const textBottomPercent = (textPaddingY_MM / cellHeightMM) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-2">
      <span className="text-xs font-semibold text-muted-foreground w-full text-left mb-3 shrink-0">
        Vorschau: Seite 1 ({pageWidth} × {pageHeight} mm, {columns}x{rows} Grid)
      </span>

      {/* Papier-Container */}
      <div className="flex items-center justify-center w-full h-full overflow-hidden flex-1">
        <div
          className="bg-white border border-zinc-300 shadow-md relative flex flex-col transition-all duration-200"
          style={{
            aspectRatio,
            maxHeight: "100%",
            maxWidth: "100%",
            // Außenränder simulieren (margins)
            padding: `${pTop}% ${pRight}% ${pBottom}% ${pLeft}%`,
          }}
        >
          {/* Platzhalter für Header (da HeaderHeight=0 im Backend, wird das hier nicht sichtbar sein) */}
          {headerHeightMM > 0 && (
            <div
              style={{ height: `${pHeader}%` }}
              className="w-full border-b border-dashed border-zinc-200"
            />
          )}

          {/* Grid Layout für die Plays (Nutzfläche) */}
          <div
            className="grid flex-1 overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              // Lücken zwischen den Zellen (Gaps) in MM simulieren
              // CSS `gap` funktioniert hier gut, da wir `usableWidth` korrekt berechnet haben
              gap: `${relGapMM}mm`,
            }}
          >
            {/* Wir füllen das Grid immer komplett auf */}
            {Array.from({ length: playsPerPage }).map((_, i) => {
              const play = firstPagePlays[i];

              return (
                <div
                  key={i}
                  className={`relative flex flex-col items-center justify-center overflow-hidden transition-colors ${
                    play
                      ? // 4. Rahmen & Hintergrund analog Backend doc.rect() & loadPlay()
                        "border border-black bg-white" // Schwarzer Rahmen, weißer Hintergrund
                      : "border border-dashed border-zinc-200 bg-zinc-50"
                  }`}
                >
                  {play ? (
                    <>
                      {/* Das Bild füllt die gesamte Zelle (addImage nimmt volle cell Maße) */}
                      <img
                        src={play.thumbnail}
                        alt={play.title}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      />
                      {/* 5. Titel Overlay analog Backend renderCell Text-Positionierung */}
                      {options.showLabels !== false && (
                        <div
                          className="absolute font-bold text-black truncate leading-none"
                          style={{
                            // Positionierung unten links mit 1.5mm Padding
                            left: `${textLeftPercent}%`,
                            bottom: `${textBottomPercent}%`,
                            maxWidth: `calc(100% - ${textLeftPercent * 2}%)`,
                            // 6. Schriftstil simulieren (helvetica bolditalic, fontSize 5)
                            // pt 5 ist sehr klein, wir skalieren es visuell passend
                            fontSize: "clamp(6px, 1.2cqw, 10px)",
                            fontStyle: "italic",
                          }}
                        >
                          {play.title}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[8px] text-zinc-300">Leer</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
