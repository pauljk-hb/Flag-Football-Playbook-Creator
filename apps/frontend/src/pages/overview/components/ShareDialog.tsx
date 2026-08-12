import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ShareDialog() {
  return (
    <DialogContent className="sm:max-w-[425px] bg-muted">
      <DialogHeader>
        <DialogTitle>Teilen</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          Teilen Funktion noch nicht hinzugefügt...
        </p>
      </div>
    </DialogContent>
  );
}
