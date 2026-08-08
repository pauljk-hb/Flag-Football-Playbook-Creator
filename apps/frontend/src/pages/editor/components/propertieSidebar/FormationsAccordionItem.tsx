import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePlaybook } from "@/hooks/usePlaybook";
import { FORMATION_PRESETS } from "@playbook/core";

export function FormationAccordionItem() {
  const { engine } = usePlaybook();
  if (!engine) return null;

  const allSystemFormations = engine.getAllSystemFormations();
  return (
    <AccordionItem value="formations" className="px-4">
      <AccordionTrigger className="text-sm hover:no-underline">
        Formationen
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <p className="text-xs text-muted-foreground">System</p>

        {allSystemFormations.map((formation, index) => {
          const preset = FORMATION_PRESETS[formation];

          return (
            <div key={index} className="mb-2">
              <Button
                key={index}
                variant="outline"
                className="w-full h-auto flex flex-col items-center justify-center p-3 gap-2"
                onClick={() => engine.loadFormation(formation)}
              >
                {/* 1. Das Base64-Vorschaubild */}
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="w-full h-28 object-cover rounded bg-background/50 p-1"
                  loading="lazy"
                />

                {/* 2. Der Name der Formation darunter */}
                <span className="text-xs font-semibold text-foreground text-center line-clamp-1">
                  {preset.name}
                </span>
              </Button>
            </div>
          );
        })}
        <Separator orientation="horizontal" className="w-full my-4" />

        <p className="text-xs text-muted-foreground">Eigene Formationen</p>

        <Button variant="secondary" className="w-full h-10">
          Formation speichern
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}
