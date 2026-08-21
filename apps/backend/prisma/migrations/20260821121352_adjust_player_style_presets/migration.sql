/*
  Warnings:

  - You are about to drop the column `userId` on the `PlayerStylePreset` table. All the data in the column will be lost.
  - Added the required column `playbookId` to the `PlayerStylePreset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PlayerStylePreset` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerStylePreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playbookId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#000000',
    "shape" TEXT NOT NULL DEFAULT 'circle',
    "showLabels" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerStylePreset_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerStylePreset" ("color", "createdAt", "id", "label", "playerId", "shape", "showLabels") SELECT "color", "createdAt", "id", "label", "playerId", "shape", "showLabels" FROM "PlayerStylePreset";
DROP TABLE "PlayerStylePreset";
ALTER TABLE "new_PlayerStylePreset" RENAME TO "PlayerStylePreset";
CREATE UNIQUE INDEX "PlayerStylePreset_playbookId_playerId_key" ON "PlayerStylePreset"("playbookId", "playerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
