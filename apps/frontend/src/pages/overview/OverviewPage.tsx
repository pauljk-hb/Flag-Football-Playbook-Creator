import { Button } from "@/components/ui/button";
import { RouteTreeIcon } from "@/components/ui/icons/RouteTreeIcon";
import { usePlaybookOverview, type SortOption } from "./hooks/usePlayOverview";
import { ArrowUpDown, Plus, Search, Settings, Share2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { PlayCard } from "./components/PlayCard";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ShareDialog } from "./components/ShareDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlphaWarningDialog } from "./components/AlphaWarningDialog";
import { TagFilterInput } from "./components/TagFilterInput";

export function Playbook() {
  const {
    plays,
    tags,
    isLoading,
    selectedTags,
    setSelectedTags,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    handleNewPlay,
    onDelete,
  } = usePlaybookOverview();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Lade Plays...</div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <header className="flex items-center justify-between px-4 h-12 border-b bg-muted flex-none">
        <div className="flex items-center gap-2">
          <RouteTreeIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight text-muted-foreground">
            Playbook Designer
          </span>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              }
            />
            <ShareDialog />
          </Dialog>

          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              }
            />
            <SettingsDialog />
          </Dialog>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
        <div className="w-full space-y-6">
          <div className="flex flex-col mb-12 sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex gap-4">
              <h1 className="text-4xl font-bold tracking-tight -mt-2">Plays</h1>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-32 h-9">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Sortieren..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alpha-asc">Alphabetisch (A-Z)</SelectItem>
                  <SelectItem value="alpha-desc">Alphabetisch (Z-A)</SelectItem>
                  <SelectItem value="date-desc">Neueste zuerst</SelectItem>
                  <SelectItem value="date-asc">Älteste zuerst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Oben Rechts: Suche, Filter & Neuer Play Button */}
            <div className="flex items-center gap-2">
              {/* Suchfeld mit Icon */}
              <InputGroup className="max-w-xs">
                <InputGroupInput
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>

              <TagFilterInput
                tags={tags}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />

              <Button onClick={handleNewPlay} size="sm" className="h-9 ml-2">
                <Plus className="h-4 w-4 mr-2" />
                Neues Play
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Lade Plays...
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(245px,1fr))] gap-6">
              {plays.length === 0 ? (
                <p className="text-foreground py-4">Keine Plays gefunden.</p>
              ) : (
                plays.map((play) => (
                  <PlayCard key={play.id} play={play} onDelete={onDelete} />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <AlphaWarningDialog />
    </div>
  );
}
