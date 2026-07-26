import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { usePlaybook } from "@/contexts/PlaybookContext";

export function FieldAccordionItem() {
  const { engine } = usePlaybook();
  if (!engine) return null;
  return (
    <AccordionItem value="field" className="px-4">
      <AccordionTrigger className="text-sm hover:no-underline">
        Feld
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <div className="mb-1">
          <Button
            variant="outline"
            className="h-10 w-full"
            onClick={() => engine.changeFieldPreset("STANDARD")}
          >
            Standard
          </Button>
        </div>
        <div className="mb-1">
          <Button
            variant="outline"
            className="h-10 w-full"
            onClick={() => engine.changeFieldPreset("ONE_POINT_TRY")}
          >
            1 Pt. Try
          </Button>
        </div>
        <div className="mb-1">
          <Button
            variant="outline"
            className="h-10 w-full"
            onClick={() => engine.changeFieldPreset("TWO_POINT_TRY")}
          >
            2 Pt. Try
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
