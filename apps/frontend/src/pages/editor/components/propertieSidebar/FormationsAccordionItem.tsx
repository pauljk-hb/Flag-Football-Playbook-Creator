import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { usePlaybook } from "@/hooks/usePlaybook";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";
import { FORMATION_PRESETS } from "@playbook/core";

export function FormationAccordionItem() {
  const { engine } = usePlaybook();
  if (!engine) return null;

  const { loadFormation } = usePlaybookActions();

  const allSystemFormations = engine.getAllSystemFormations();
  return (
    <AccordionItem value="formations" className="px-4">
      <AccordionTrigger className="text-sm hover:no-underline">
        Formationen
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <Accordion className="w-full" defaultValue={["system"]}>
          <AccordionItem value="system" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline font-normal text-xs text-muted-foreground tracking-wider">
              System
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {allSystemFormations.map((formation, index) => {
                const preset = FORMATION_PRESETS[formation];

                return (
                  <div key={index} className="mb-2">
                    <Button
                      key={index}
                      variant="secondary"
                      className="w-full h-auto flex flex-col items-center justify-center p-2 gap-2 hover:bg-foreground/20"
                      onClick={() => loadFormation(formation)}
                    >
                      {/* 1. Das Base64-Vorschaubild */}
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="w-full h-20 object-cover object-top rounded bg-background/50"
                        loading="lazy"
                      />

                      {/* 2. Der Name der Formation darunter */}
                      <span className="text-xs font-semibold text-foreground text-center line-clamp-1 tracking-wider py-1">
                        {preset.name}
                      </span>
                    </Button>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="custom" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline font-normal text-xs text-muted-foreground tracking-wider">
              Eigene Formationen
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <p className="text-xs text-muted-foreground">
                Diese Funktion ist akutell noch nicht verfügbar
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
