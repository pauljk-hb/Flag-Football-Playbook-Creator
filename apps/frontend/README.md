**Frontend Documentation: Playbook Creator**

**Übersicht**
Dieses Repository enthält die Frontend-Anwendung für die interaktive Flag Football Playbook Plattform. Die Architektur fokussiert sich auf eine strikte Trennung von UI-Komponenten und Business-Logik (Separation of Concerns). Das Kernstück bildet ein Vektorgrafik-Editor zur Erstellung von Spielzügen, ergänzt durch ein performantes Tag-Management-System.

**Technologie-Stack**

- Framework: React mit TypeScript
- Styling: Tailwind CSS, Shadcn UI, Kibo-UI (cmdk)
- Canvas-Engine: Fabric.js (gekapselt in einer eigenen PlaybookAPI)
- State Management: Zustand (für globale States wie Themes) & Custom Hooks
- Routing: React Router

**Architektur & Struktur**
Die Codebase ist modular aufgebaut, um Duplikationen zu vermeiden und die Testbarkeit zu maximieren.

- /components: Enthält rein präsentationale, zustandslose UI-Komponenten (Modals, Buttons, Inputs).
- /hooks: Kapselt die gesamte komplexe Anwendungslogik, API-Aufrufe und das Canvas-Lifecycle-Management (z. B. useEditorData, usePlaybookEngine, usePlayTags, useAsync).
- /api: Zentraler API-Client für die strukturierte Kommunikation mit dem Backend.
- /types: Zentrale TypeScript-Interfaces für eine durchgängige Typsicherheit.

**Kernfunktionen**

- Playbook Canvas: Interaktiver Editor für das Zeichnen von Routen, Zuweisen von Spielern (inkl. Undo/Redo-Historie) und Export-Funktionen.
- Tag-Management: System zur Kategorisierung von Spielzügen, inklusive dynamischem Filtern und Inline-Bearbeitung von Farben und Namen.
- Hotkey-System: Umfangreiche Tastaturkürzel für effizientes Arbeiten (Player-Platzierung, Routen-Auswahl).
- Theme-Support: Vollständig integrierter Light-, Dark- und System-Mode.

**Entwicklung (Setup)**

1. Abhängigkeiten installieren:
   npm install
2. Umgebungsvariablen konfigurieren:
   Erstellen Sie eine .env Datei basierend auf den Vorgaben des Backends (z. B. API-Basis-URL).
3. Entwicklungsserver starten:
   npm run dev
4. Produktions-Build erstellen:
   npm run build
