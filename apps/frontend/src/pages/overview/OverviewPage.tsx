import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteTreeIcon } from "@/components/ui/icons/RouteTreeIcon";
import type { Play } from "@/types/interface";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaybookOverview } from "./hooks/usePlayOverview";
import { Plus } from "lucide-react";

export function Playbook() {
  const navigate = useNavigate();
  const { handleNewPlay } = usePlaybookOverview();

  const [plays, setPlays] = useState<Play[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlays() {
      try {
        const data = await api.plays.getAll();
        setPlays(data);
      } catch (error) {
        console.error("Fehler beim Laden der Plays:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPlays();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Lade Plays...</div>
    );
  }

  return (
    <>
      <header className="px-4 border-b py-2 fixed top-0 left-0 right-0 z-10 bg-background">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
            <RouteTreeIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Playbook Designer
            </h1>
            <p className="text-xs text-slate-400">
              Play-Bibliothek & Strategie-Editor
            </p>
          </div>
          <div className="ml-24">
            <Button onClick={handleNewPlay} className="w-full">
              <Plus />
            </Button>
          </div>
        </div>
      </header>
      <main className="mt-16 flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {" "}
        {plays.map((play) => (
          <Card key={play.id} className="overflow-hidden">
            <div className="aspect-4/3 w-full bg-muted flex items-center justify-center border-b">
              {play.thumbnail ? (
                <img
                  src={play.thumbnail}
                  alt={play.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground font-mono">
                  [ Field Preview ]
                </span>
              )}
            </div>

            {/* 2. Alle Infos gebündelt darunter */}
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge>Badge</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(play.updatedAt).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <CardTitle className="pt-1">{play.title}</CardTitle>
            </CardHeader>

            <CardFooter>
              <Button
                onClick={() => navigate(`/editor/${play.id}`)}
                className="w-full"
              >
                Play öffnen
              </Button>
            </CardFooter>
          </Card>
        ))}
      </main>
    </>
  );
}
