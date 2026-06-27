import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComandaStatus1782401239491 implements MigrationInterface {
  name = 'AddComandaStatus1782401239491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`comandas\` ADD \`status\` varchar(10) NOT NULL DEFAULT 'aberta'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`comandas\` DROP COLUMN \`status\``);
  }
}
