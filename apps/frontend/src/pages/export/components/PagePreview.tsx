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
  const PREVIEW_HEIGHT = 190;
  const previewData = usePreview(options, PREVIEW_HEIGHT);

  const playsPerPage = options.columns * options.rows || 1;
  const firstPagePlays = plays.slice(0, playsPerPage);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <span className="text-xs font-semibold text-muted-foreground w-full text-left mb-2 shrink-0">
        Vorschau (leichte Abweichungen möglich): Seite 1 (
        {options.pageWidth || 0} × {options.pageHeight || 0} mm)
      </span>

      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        <div
          className="bg-white border border-zinc-300 shadow-md relative"
          style={{
            width: `${previewData.paperWidthPx}px`,
            height: `${previewData.paperHeightPx}px`,
          }}
        >
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
                  borderStyle: play ? "solid" : "none",
                  borderColor: "black",
                  borderWidth: `${0.3 * previewData.scale}px`,
                }}
              >
                {play ? (
                  <>
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
                  <div className="w-full h-full flex items-center justify-center"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
