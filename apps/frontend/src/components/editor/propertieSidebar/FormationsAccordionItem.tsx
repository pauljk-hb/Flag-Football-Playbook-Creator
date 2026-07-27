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
        {allSystemFormations.map((formation, index) => (
          <div key={index} className="mb-1">
            <Button
              variant="outline"
              className="h-10 w-full"
              onClick={() => engine.loadFormation(formation)}
            >
              {FORMATION_PRESETS[formation].name}
            </Button>
          </div>
        ))}
        <Separator orientation="horizontal" className="w-full my-4" />

        <p className="text-xs text-muted-foreground">Eigene Formationen</p>

        <Button variant="secondary" className="w-full h-10">
          Formation speichern
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}
