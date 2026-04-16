import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureLoginsSchema1744636803000 implements MigrationInterface {
  name = 'EnsureLoginsSchema1744636803000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('logins');

    if (!hasTable) {
      await queryRunner.query(`
        CREATE TABLE \`logins\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`email\` varchar(255) NOT NULL,
          \`password_hash\` varchar(255) NOT NULL,
          \`nome\` varchar(255) DEFAULT NULL,
          \`ativo\` tinyint NOT NULL DEFAULT 1,
          \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`UQ_logins_email\` (\`email\`)
        ) ENGINE=InnoDB
      `);
      return;
    }

    const table = await queryRunner.getTable('logins');
    if (table?.findColumnByName('email')) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`logins\`
        ADD \`email\` varchar(255) NOT NULL,
        ADD \`password_hash\` varchar(255) NOT NULL,
        ADD \`nome\` varchar(255) DEFAULT NULL,
        ADD \`ativo\` tinyint NOT NULL DEFAULT 1,
        ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_logins_email\` ON \`logins\` (\`email\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('logins'))) {
      return;
    }

    const table = await queryRunner.getTable('logins');
    if (!table?.findColumnByName('email')) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`logins\`
        DROP COLUMN \`email\`,
        DROP COLUMN \`password_hash\`,
        DROP COLUMN \`nome\`,
        DROP COLUMN \`ativo\`,
        DROP COLUMN \`created_at\`,
        DROP COLUMN \`updated_at\`
    `);
  }
}
