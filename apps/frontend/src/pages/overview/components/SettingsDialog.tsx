import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/hooks/useAppStore";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export function SettingsDialog() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { data: session } = useSession();

  return (
    // Breiterer Dialog (600px) für mehr Platz und ein "Fenster"-Gefühl
    <DialogContent className="sm:max-w-150 p-0 overflow-hidden flex flex-col bg-muted">
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <DialogTitle className="text-xl">Einstellungen</DialogTitle>
        <DialogDescription>
          Passe die App an deine Bedürfnisse und deinen Playstyle an.
        </DialogDescription>
      </DialogHeader>

      <div className="bg-background">
        <Tabs defaultValue="appearance" className="w-full">
          {/* TAB-LEISTE */}
          <TabsList variant="line" className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="appearance">Aussehen</TabsTrigger>
            <TabsTrigger value="profile">Nutzerprofil</TabsTrigger>
            <TabsTrigger value="playstyle">Playstyle</TabsTrigger>
          </TabsList>

          {/* TAB: AUSSEHEN (THEME) */}
          <TabsContent
            value="appearance"
            className="space-y-6 px-6 py-4 outline-none"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Erscheinungsbild</h3>
                <p className="text-xs text-muted-foreground">
                  Wähle zwischen hellem und dunklem Modus.
                </p>
              </div>

              {/* Theme Selector - Desktop Style (Klickbare Boxen) */}
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col h-24 gap-2 items-center justify-center border-2 transition-all",
                    theme === "light"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50",
                  )}
                >
                  <Sun
                    className={cn(
                      "h-6 w-6",
                      theme === "light"
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="text-xs font-medium">Light</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col h-24 gap-2 items-center justify-center border-2 transition-all",
                    theme === "dark"
                      ? "border-primary! bg-primary/5!"
                      : "hover:border-primary/50",
                  )}
                >
                  <Moon
                    className={cn(
                      "h-6 w-6",
                      theme === "dark"
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="text-xs font-medium">Dark</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col h-24 gap-2 items-center justify-center border-2 transition-all",
                    theme === "system"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50",
                  )}
                >
                  <Monitor
                    className={cn(
                      "h-6 w-6",
                      theme === "system"
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="text-xs font-medium">System</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB: NUTZERPROFIL */}
          <TabsContent
            value="profile"
            className="space-y-6  px-6 py-4 outline-none"
          >
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Hier folgen Einstellungen zum Nutzerprofil von{" "}
                {session?.user.name}...
              </p>
            </div>
          </TabsContent>

          {/* TAB: PLAYSTYLE */}
          <TabsContent
            value="playstyle"
            className="space-y-6  px-6 py-4 outline-none"
          >
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Hier folgen Einstellungen zu Objekten in einem Play (z.b. Farbe
                von Spielern ändern)...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  );
}
