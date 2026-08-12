import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Play } from "@/types/interface";

interface DeletePopUpProps {
  play: Play;
  onDelete: (playId: string) => void;
}

export function DeletePopUp({ play, onDelete }: DeletePopUpProps) {
  return (
    <AlertDialogContent
      onClick={(e) => e.stopPropagation()}
      className="bg-background"
    >
      <AlertDialogHeader>
        <AlertDialogTitle>Play wirklich löschen?</AlertDialogTitle>
        <AlertDialogDescription>
          Möchtest du das Play "{play.name}" endgültig löschen? Diese Aktion
          kann nicht rückgängig gemacht werden.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
          Abbrechen
        </AlertDialogCancel>
        <AlertDialogAction
          className={cn(
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(play.id);
          }}
        >
          Löschen
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
