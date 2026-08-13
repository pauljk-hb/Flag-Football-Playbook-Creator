import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/hooks/useAppStore";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Clock,
  Database,
} from "lucide-react";

export function AlphaWarningDialog() {
  const hasSeenAlphaWarning = useAppStore((state) => state.hasSeenAlphaWarning);
  const setHasSeenAlphaWarning = useAppStore(
    (state) => state.setHasSeenAlphaWarning,
  );

  return (
    <AlertDialog open={!hasSeenAlphaWarning}>
      <AlertDialogContent className="max-w-lg! sm:max-w-md bg-background max-h-[90vh] flex flex-col p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Willkommen in der Alpha!
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-base">
            Diese Software befindet sich in einer frühen{" "}
            <strong>Entwicklungsphase (Alpha)</strong>. Es kann noch zu Fehlern,
            fehlenden Funktionen oder unerwartetem Verhalten kommen.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2 space-y-4 overflow-y-auto pr-2 -mr-2">
          {/* BEREITS DRIN */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Bereits integriert
            </h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-1">
              <li>Playbook Grid-Ansicht</li>
              <li>Verschiedene Playbooks</li>
              <li>Plays filtern</li>
              <li>Spieler & Formationen einfügen</li>
              <li>Zeichnen & Einfügen von Routen</li>
              <li>Light / Dark Mode Unterstützung</li>
              <li>Tastenkürzel (Hotkeys) im Editor</li>
              <li>Undo / Redo von Operationen</li>
              <li>Cloud-Synchronisation</li>
            </ul>
          </div>

          {/* FOLGT NOCH */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-blue-500" />
              Folgt in Kürze
            </h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-1">
              <li>PDF-Export von Playbooks</li>
              <li>Playbooks teilen</li>
              <li>Preset Routen beim Einfügen an Rand anpassen</li>
              <li>Beabeiten von Player Presets</li>
              <li>Speichern von Routen Presets</li>
              <li>Gemeinsames bearbeiten von Playbooks</li>
            </ul>
          </div>

          {/* BUGS MELDEN */}
          <div className="bg-muted/50 p-3 rounded-lg border flex items-start gap-3 mt-4">
            <Bug className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Du hast einen Bug gefunden oder hast Feedback? Bitte melde dich,
              damit wir die Fehler gemeinsam schnell ausräumen können!
            </p>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg border flex items-start gap-3">
          <Database className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Achtung: Aufgrund von laufenden Datenbank-Migrationen in der
            Alpha-Phase kann es aktuell noch zu Datenverlusten kommen.
          </p>
        </div>

        <AlertDialogFooter className="mt-2">
          {/* Beim Klick feuern wir die Funktion im Zustand-Store, was den Dialog schließt */}
          <AlertDialogAction
            onClick={setHasSeenAlphaWarning}
            className="w-full sm:w-auto"
          >
            Alles klar, verstanden!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
