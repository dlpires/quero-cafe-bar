import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigratePasswordToBcrypt1771686245260
  implements MigrationInterface
{
  name = 'MigratePasswordToBcrypt1771686245260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`usuarios\` CHANGE \`senha\` \`senha\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`usuarios\` CHANGE \`senha\` \`senha\` text NOT NULL`,
    );
  }
}
