import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLogTable1782429650616 implements MigrationInterface {
  name = 'AddAuditLogTable1782429650616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`audit_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`action\` varchar(50) NOT NULL, \`resource\` varchar(50) NOT NULL, \`resource_id\` int NULL, \`details\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`audit_logs\``);
  }
}
