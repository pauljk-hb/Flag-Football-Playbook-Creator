import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlaybook } from "@/contexts/PlaybookContext";
import type { Play } from "@/types/interface";
import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";

export function Playbook() {
  const navigate = useNavigate();

  const [plays, setPlays] = useState<Play[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlays() {
      try {
        const data = await api.plays.getAll();
        setPlays(data);
        console.log("Geladene Plays:", data);
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

  if (plays.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Keine Plays vorhanden. Erstelle dein erstes!
      </div>
    );
  }

  return (
    <>
      <header className="px-4 border-b py-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Playbook Designer
            </h1>
            <p className="text-xs text-slate-400">
              Play-Bibliothek & Strategie-Editor
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {plays.map((play) => (
          <Card key={play.id} className="overflow-hidden w-64">
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
                  Formation XY
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
