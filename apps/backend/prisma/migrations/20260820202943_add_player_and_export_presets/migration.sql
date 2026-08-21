-- CreateTable
CREATE TABLE "PlayerStylePreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#000000',
    "shape" TEXT NOT NULL DEFAULT 'circle',
    "showLabels" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerStylePreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Playbook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExportPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pageWidth" REAL NOT NULL,
    "pageHeight" REAL NOT NULL,
    "columns" INTEGER NOT NULL,
    "rows" INTEGER NOT NULL,
    "gap" REAL NOT NULL,
    "marginTop" REAL NOT NULL,
    "marginRight" REAL NOT NULL,
    "marginBottom" REAL NOT NULL,
    "marginLeft" REAL NOT NULL,
    "routeStrokeWidth" REAL,
    "showLabels" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExportPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
