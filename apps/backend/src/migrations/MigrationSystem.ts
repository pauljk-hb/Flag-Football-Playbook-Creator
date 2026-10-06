export interface PlayMigration {
  fromVersion: number;
  toVersion: number;
  migrate: (data: any) => any;
}

export const CURRENT_PLAY_VERSION = 1;

export class PlayMigrationRunner {
  private migrations: PlayMigration[];

  constructor(migrations: PlayMigration[]) {
    this.migrations = migrations.sort((a, b) => a.fromVersion - b.fromVersion);
  }

  public run(rawData: string | any): { data: any; wasMigrated: boolean } {
    let data =
      typeof rawData === "string" ? JSON.parse(rawData) : { ...rawData };

    let currentVersion = data.version || 0;
    const initialVersion = currentVersion;

    for (const migration of this.migrations) {
      if (
        currentVersion === migration.fromVersion &&
        currentVersion < CURRENT_PLAY_VERSION
      ) {
        console.log(
          `[Migration] Update Play von v${migration.fromVersion} auf v${migration.toVersion}...`,
        );

        data = migration.migrate(data);
        data.version = migration.toVersion;
        currentVersion = migration.toVersion;
      }
    }

    return {
      data,
      wasMigrated: currentVersion !== initialVersion,
    };
  }
}
