> ⚠️ **Achtung: Alpha-Phase & Breaking Changes**
>
> Dieses Projekt befindet sich aktuell in einer **frühen Alpha-Phase**. Es finden fortlaufend Datenbank-Migrationen und tiefgreifende Architektur-Änderungen statt. **Es kann aktuell zu Datenverlusten kommen.** Nutze die Anwendung derzeit bitte noch nicht für kritische Produktionsdaten.

# Installation & Schnellstart

### Web App

Der schnellste Weg zum eigenen Playbook. Starte direkt im Browser ohne Installation.

### Lokale Entwicklung

Klone das Repository und starte die Entwicklungsumgebung lokal auf deinem Rechner:

```bash
# Repository klonen
git clone [dieses Reop]

# Abhängigkeiten installieren
npm install
```

#### Backend & Database Initialization

Bevor das Frontend gestartet wird, muss die SQLite-Datenbank erstellt und die Umgebungsvariablen für das Backend konfiguriert werden.

Wechseln Sie in das Backend-Verzeichnis:

```bash
cd apps/backend
```

Umgebungsvariablen einrichten:
Erstelle eine `.env` Datei und konfiguriere `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, und `GOOGLE_CLIENT_SECRET`.

Generiere den Prisma-Client und übertrage das Schema in die lokale SQLite-Datenbank:

```bash
npx prisma db push
npx prisma generate
```

Starte die Anwendung

```bash
npm run dev
```

# Dokumentation & Architektur

Das Projekt ist in modular getrennte Bereiche unterteilt, um eine klare Separation of Concerns zu gewährleisten. Für tiefergehende Informationen zu den einzelnen Subsystemen konsultiere die jeweiligen Dokumentationen:

- **[Core Documentation](https://github.com/pauljk-hb/Flag-Football-Playbook-Creator/tree/main/packages/core/ReadMe.md)(https://github.com/pauljk-hb/Flag-Football-Playbook-Creator/blob/main/packages/core/readMe.md):** Headless Engine, Fabric.js Canvas-Rendering, Command-Pattern (Undo/Redo), RouteDrawingManager & Event-Driven Architecture.
- **[Frontend Documentation](https://www.google.com/search?q=./src/frontend/README.md):** React Components, UI-Toolbars, State-Synchronization, Theme-Handling & Hotkeys.
- **[Backend Documentation](https://www.google.com/search?q=./src/backend/README.md):** API-Routen, Datenbank-Schemas, Authentifizierung & Cloud-Synchronisation.

# Features & Roadmap

Hier ist die Übersicht der aktuellen Features und der geplanten Funktionen auf Deutsch:

### Bereits integriert

- **Playbook Grid-Ansicht:** Übersichtliche Darstellung aller Spielzüge auf dem Spielfeld.
- **Verschiedene Playbooks:** Taktikbücher strukturiert anlegen, verwalten und organisieren.
- **Plays filtern:** Schnelle Suche und Filterung nach Tags, Typen oder Namen.
- **Spieler & Formationen:** Aufstellung von Spielern und Formationen per Mausklick.
- **Zeichnen & Einfügen von Routen:** Freies Zeichnen von Pfaden sowie Platzieren von Standard-Routen.
- **Light / Dark Mode:** Volle Unterstützung für helle und dunkle Benutzeroberflächen-Themes.
- **Tastenkürzel (Hotkeys):** Schnelleres Arbeiten und Steuern im Editor über die Tastatur.
- **Undo / Redo:** Vollständiges Rückgängigmachen und Wiederherstellen von Aktionen (Command Pattern).
- **Cloud-Synchronisation:** Automatische Speicherung und Synchronisation von Spielzügen im Hintergrund.

---

### Folgt in Kürze (Roadmap)

- **PDF-Export von Playbooks:** Druckfertiges Generieren von Playbooks und Play-Sheets als PDF.
- **Playbooks teilen:** Freigabe von Playbooks mit Lese- und Schreibrechten für Teammitglieder.
- **Smart Route Fitting:** Automatisches Anpassen von Preset-Routen an den Feldrand.
- **Kurven im freien Zeichnen:** Kurven zeichnem im freien Zeichenmodus.
- **Bearbeiten von Player Presets:** Anpassen und Speichern eigener Spieler-Standards und -Icons.
- **Speichern von Routen-Presets:** Eigene häufig genutzte Routenbausteine speichern und wiederverwenden.
- **Gemeinsames Bearbeiten:** Kollaboratives Arbeiten an Playbooks in Echtzeit (Multiplayer Co-Editing).

# Tech Stack

- TypeScript
- React
- Fabric.js (v7) (Canvas Rendering Engine)
- Tailwind CSS & shadcn/ui
