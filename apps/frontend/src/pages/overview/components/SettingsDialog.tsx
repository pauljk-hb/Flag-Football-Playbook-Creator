import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useThemeStore } from "@/hooks/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";

export function SettingsDialog() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { data: session } = useSession();
  const { handleLogout } = useAuth();

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
      {children}
    </kbd>
  );

  const shortcutGroups = [
    {
      title: "Verlauf (History)",
      shortcuts: [
        { keys: ["⌘/Strg", "Z"], description: "Rückgängig (Undo)" },
        { keys: ["⌘/Strg", "Shift", "Z"], description: "Wiederholen (Redo)" },
      ],
    },
    {
      title: "Spieler hinzufügen",
      shortcuts: [
        { keys: ["Q"], description: "Quarterback (QB)" },
        { keys: ["C"], description: "Center" },
        { keys: ["X"], description: "Wide Receiver 1 (WR1)" },
        { keys: ["Y"], description: "Wide Receiver 2 (WR2)" },
        { keys: ["R"], description: "Red" },
      ],
    },
    {
      title: "Allgemein",
      shortcuts: [
        {
          keys: ["Backspace", "oder", "Entf"],
          description: "Ausgewähltes Objekt löschen",
        },
      ],
    },
    {
      title: "Routen zeichnen",
      shortcuts: [
        { keys: ["1"], description: "Quick Out" },
        { keys: ["2"], description: "Slant" },
        { keys: ["3"], description: "Come Back" },
        { keys: ["4"], description: "Hitch" },
        { keys: ["5"], description: "Out" },
        { keys: ["6"], description: "In" },
        { keys: ["7"], description: "Corner" },
        { keys: ["8"], description: "Post" },
        { keys: ["9"], description: "Go" },
      ],
    },
  ];

  return (
    // Breiterer Dialog (600px) für mehr Platz und ein "Fenster"-Gefühl
    <DialogContent className="sm:max-w-2xl p-0 overflow-hidden flex flex-col bg-muted">
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <DialogTitle className="text-xl">Einstellungen</DialogTitle>
      </DialogHeader>

      <div className="bg-background">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList variant="line" className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="appearance">Aussehen</TabsTrigger>
            <TabsTrigger value="profile">Nutzerprofil</TabsTrigger>
            <TabsTrigger value="playstyle">Playstyle</TabsTrigger>
            <TabsTrigger value="help">Hilfe & Shortcuts</TabsTrigger>
          </TabsList>

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

          <TabsContent
            value="profile"
            className="space-y-6  px-6 py-4 outline-none"
          >
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Hier folgen Einstellungen zum Nutzerprofil von{" "}
                {session?.user.name}...
              </p>
              <Button onClick={handleLogout}>Ausloggen</Button>
            </div>
          </TabsContent>

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

          <TabsContent
            value="help"
            className="space-y-8 px-6 py-4 outline-none m-0"
          >
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 border">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">
                    Playbook Engine
                  </span>
                  <span>v0.5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">
                    Fabric.js Version
                  </span>
                  <span>v7.4.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Umgebung</span>
                  <span>Produktion</span>
                </div>
              </div>
              <p className="text-xs">
                Solltest du Fehler im Editor finden, lade die Seite neu
                (Cmd/Strg + R).
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">
                  Tastenkürzel (Shortcuts)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Nutze diese Tasten, um im Editor schneller arbeiten zu können.
                </p>
              </div>

              <div className="columns-1 md:columns-2 gap-x-8">
                {shortcutGroups.map((group) => (
                  <div key={group.title} className="break-inside-avoid mb-8">
                    <h4 className="font-semibold text-xs mb-3 text-foreground border-b pb-1">
                      {group.title}
                    </h4>
                    <ul className="space-y-2.5">
                      {group.shortcuts.map((shortcut, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">
                            {shortcut.description}
                          </span>
                          <div className="flex gap-1 items-center">
                            {shortcut.keys.map((key, j) => (
                              <span key={j} className="flex items-center gap-1">
                                {key === "oder" ? (
                                  <span className="text-[10px] text-muted-foreground mx-1">
                                    oder
                                  </span>
                                ) : (
                                  <Kbd>{key}</Kbd>
                                )}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  );
}
