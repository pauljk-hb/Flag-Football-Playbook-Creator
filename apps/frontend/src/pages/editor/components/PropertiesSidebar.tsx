import { Accordion } from "@/components/ui/accordion";
import type { Play } from "@/types/interface";
import { FieldAccordionItem } from "./propertieSidebar/FieldAccordionItem";
import { FormationAccordionItem } from "./propertieSidebar/FormationsAccordionItem";
import { GeneralAccordionItem } from "./propertieSidebar/GeneralAccordionItem";
import { RouteAccordionItem } from "./propertieSidebar/RouteAccordionItem";

interface SidebarProps {
  play: Play;
  playTitle: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (title: string) => void;
}

export function PropertiesSidebar({
  play,
  playTitle,
  onTitleChange,
  description,
  onDescriptionChange,
}: SidebarProps) {
  return (
    <aside className="w-100 border-l bg-muted overflow-y-auto shrink-0">
      <div className="p-4 border-b bg-muted">
        <h2 className="font-semibold text-sm">Eigenschaften</h2>
      </div>

      <Accordion defaultValue={["general"]} className="w-full">
        <GeneralAccordionItem
          play={play}
          playTitle={playTitle}
          onTitleChange={onTitleChange}
          description={description}
          onDescriptionChange={onDescriptionChange}
        />

        <FormationAccordionItem />

        <RouteAccordionItem />

        <FieldAccordionItem />
      </Accordion>
    </aside>
  );
}
