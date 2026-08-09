import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Play } from "@/types/interface";
import { useNavigate } from "react-router-dom";

interface PlayCardProps {
  play: Play;
}

export function PlayCard({ play }: PlayCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      key={play.id}
      // Desktop-Feeling: Die ganze Karte ist klickbar, dezenter Hover-Effekt
      className="overflow-hidden cursor-pointer group hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
      onClick={() => navigate(`/editor/${play.id}`)}
    >
      <div className="aspect-[4/3] w-full bg-muted/50 flex items-center justify-center border-b border-border/50 overflow-hidden relative">
        {play.thumbnail ? (
          <img
            src={play.thumbnail}
            alt={play.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-xs text-muted-foreground font-mono">
            [ Field Preview ]
          </span>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Offense
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {new Date(play.updatedAt).toLocaleDateString("de-DE", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <CardTitle className="text-sm font-semibold truncate">
          {play.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        {/* Hier könnte später noch eine kleine Beschreibung oder Tags stehen */}
        <p className="text-xs text-muted-foreground truncate">
          Keine Beschreibung vorhanden
        </p>
      </CardContent>
    </Card>
  );
}
