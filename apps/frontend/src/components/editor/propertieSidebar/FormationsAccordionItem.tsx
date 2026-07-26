import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { usePlaybook } from "@/contexts/PlaybookContext";
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
      </AccordionContent>
    </AccordionItem>
  );
}
