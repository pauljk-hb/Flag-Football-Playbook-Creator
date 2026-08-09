import { Accordion } from "@/components/ui/accordion";
import { GeneralAccordionItem } from "./propertieSidebar/GeneralAccordionItem";
import { FormationAccordionItem } from "./propertieSidebar/FormationsAccordionItem";
import { FieldAccordionItem } from "./propertieSidebar/FieldAccordionItem";
import { RouteAccordionItem } from "./propertieSidebar/RouteAccordionItem";

interface SidebarProps {
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (title: string) => void;
}

export function PropertiesSidebar({
  title,
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
          title={title}
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
