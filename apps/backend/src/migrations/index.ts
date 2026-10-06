import { CURRENT_PLAY_VERSION, PlayMigrationRunner } from "./MigrationSystem";
import { migrateV0ToV1 } from "./scripts/migrateV0ToV1";

export const playMigrator = new PlayMigrationRunner([migrateV0ToV1]);
export { CURRENT_PLAY_VERSION };
