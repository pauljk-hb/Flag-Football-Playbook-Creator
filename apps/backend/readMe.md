# Alle Endpunkte des Backends

### Playbooks (`/api/v1/playbooks`)

| Methode    | Endpunkt                | Beschreibung                                        | Request Body (JSON)                         |
| ---------- | ----------------------- | --------------------------------------------------- | ------------------------------------------- |
| **GET**    | `/api/v1/playbooks`     | Lädt alle Playbooks des eingeloggten Users.         | -                                           |
| **POST**   | `/api/v1/playbooks`     | Erstellt ein neues Playbook.                        | `{ "name": "...", "description"?: "..." }`  |
| **PUT**    | `/api/v1/playbooks/:id` | Aktualisiert Name oder Beschreibung.                | `{ "name"?: "...", "description"?: "..." }` |
| **DELETE** | `/api/v1/playbooks/:id` | Löscht das Playbook (inklusive aller Plays & Tags). | -                                           |

---

### Spielzüge / Plays (`/api/v1/plays`)

| Methode    | Endpunkt                             | Beschreibung                                                                | Request Body (JSON)                                                                                   |
| ---------- | ------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **GET**    | `/api/v1/plays/playbook/:playbookId` | Lädt alle Spielzüge eines bestimmten Playbooks (nach `sortOrder` sortiert). | -                                                                                                     |
| **POST**   | `/api/v1/plays/playbook/:playbookId` | Erstellt einen neuen Spielzug im Playbook.                                  | `{ "name": "...", "canvasData": "...", "thumbnail"?: "...", "description"?: "...", "sortOrder"?: 0 }` |
| **GET**    | `/api/v1/plays/:id`                  | Lädt einen einzelnen Spielzug (inklusive seiner verknüpften Tags).          | -                                                                                                     |
| **PUT**    | `/api/v1/plays/:id`                  | Aktualisiert einen Spielzug (z.B. beim Speichern im Editor).                | `{ "name"?: "...", "canvasData"?: "...", "thumbnail"?: "...", "sortOrder"?: 0 }`                      |
| **DELETE** | `/api/v1/plays/:id`                  | Löscht den Spielzug.                                                        | -                                                                                                     |
| **POST**   | `/api/v1/plays/:id/tags`             | Verknüpft einen bestehenden Tag mit diesem Spielzug.                        | `{ "tagId": "..." }`                                                                                  |
| **DELETE** | `/api/v1/plays/:id/tags/:tagId`      | Entfernt die Verknüpfung zwischen Tag und Spielzug.                         | -                                                                                                     |

---

### Tags (`/api/v1/tags`)

| Methode    | Endpunkt                            | Beschreibung                                       | Request Body (JSON)                      |
| ---------- | ----------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| **GET**    | `/api/v1/tags/playbook/:playbookId` | Lädt den kompletten Tag-Pool für dieses Playbook.  | -                                        |
| **POST**   | `/api/v1/tags/playbook/:playbookId` | Erstellt einen neuen Tag im Pool dieses Playbooks. | `{ "name": "...", "color"?: "#3b82f6" }` |
| **PUT**    | `/api/v1/tags/:id`                  | Aktualisiert den Namen oder die Farbe eines Tags.  | `{ "name"?: "...", "color"?: "..." }`    |
| **DELETE** | `/api/v1/tags/:id`                  | Löscht den Tag komplett aus dem Playbook.          | -                                        |

---

Alle Endpunkte setzen voraus, dass der User eingeloggt. Die User Funktionen werden von [Better Auth](https://better-auth.com/) genutzt und die Auth Routen sind generiert.
