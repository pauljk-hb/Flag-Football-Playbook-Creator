import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { authClient, useSession } from "@/lib/auth-client";
import { AlertCircle, Loader2, LogOut, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ProfileTab() {
  const { data: session } = useSession();
  const { handleDeleteUser, handleLogout, isLoading, errorMessage } = useAuth();

  const [deletePassword, setDeletePassword] = useState("");
  const [hasCredentialAccount, setHasCredentialAccount] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    async function checkAccounts() {
      try {
        const result = await authClient.listAccounts();

        const accounts = result?.data || (Array.isArray(result) ? result : []);

        const hasPassword = accounts.some(
          (acc: any) => acc.providerId === "credential" || !acc.providerId,
        );
        setHasCredentialAccount(Boolean(hasPassword));
      } catch (err) {
        console.warn("Konnte Accounts nicht abrufen:", err);
        setHasCredentialAccount(true);
      }
    }

    if (session?.user) {
      checkAccounts();
    }
  }, [session]);

  const onConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await handleDeleteUser(hasCredentialAccount ? deletePassword : undefined);
  };
  return (
    <TabsContent value="profile" className="space-y-6 px-6 py-4 outline-none">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold">Nutzerprofil</h3>
          <p className="text-xs text-muted-foreground">
            Eingeloggt als{" "}
            <span className="font-medium text-foreground">
              {session?.user?.email ||
                session?.user?.name ||
                "Unbekannter Nutzer"}
            </span>
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="gap-2 text-xs"
          >
            <LogOut className="w-4 h-4" />
            Ausloggen
          </Button>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-destructive">
              Gefahrenbereich
            </h4>
            <p className="text-xs text-muted-foreground">
              Das Löschen deines Kontos entfernt unwiderruflich alle deine
              Playbooks, Spielzüge und Voreinstellungen.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2 text-xs"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Konto unwiderruflich löschen
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bist du absolut sicher?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span>
                    Diese Aktion kann nicht rückgängig gemacht werden. Dein
                    Nutzerkonto sowie alle erstellten Spielzüge, Presets und
                    Daten werden dauerhaft gelöscht.
                  </span>

                  {/* Zeigt das Passwortfeld nur an, wenn der User ein Passwort besitzt */}
                  {hasCredentialAccount && (
                    <div className="pt-2 text-left space-y-1.5">
                      <Label
                        htmlFor="delete-confirm-pw"
                        className="text-xs text-foreground font-medium"
                      >
                        Passwort zur Bestätigung eingeben:
                      </Label>
                      <Input
                        id="delete-confirm-pw"
                        type="password"
                        placeholder="Dein aktuelles Passwort"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>
                  Abbrechen
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onConfirmDelete}
                  disabled={
                    isLoading ||
                    (hasCredentialAccount === true && !deletePassword)
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "Ja, Konto löschen"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </TabsContent>
  );
}
