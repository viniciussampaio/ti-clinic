import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClinicSchema1744636801000 implements MigrationInterface {
  name = 'CreateClinicSchema1744636801000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`especialidade\` (
        \`espec_codigp\` int NOT NULL AUTO_INCREMENT,
        \`espec_nome\` varchar(255) NOT NULL,
        PRIMARY KEY (\`espec_codigp\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`medico\` (
        \`med_codigo\` int NOT NULL AUTO_INCREMENT,
        \`med_nome\` varchar(255) NOT NULL,
        \`med_CRM\` varchar(50) NOT NULL,
        \`espec_codigp\` int NOT NULL,
        PRIMARY KEY (\`med_codigo\`),
        KEY \`FK_medico_especialidade\` (\`espec_codigp\`),
        CONSTRAINT \`FK_medico_especialidade\` FOREIGN KEY (\`espec_codigp\`) REFERENCES \`especialidade\` (\`espec_codigp\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`paciente\` (
        \`pac_codigo\` int NOT NULL AUTO_INCREMENT,
        \`pac_nome\` varchar(255) NOT NULL,
        \`pac_dataNascimento\` date NOT NULL,
        PRIMARY KEY (\`pac_codigo\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`paciente_telefones\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`pac_codigo\` int NOT NULL,
        \`telefone\` varchar(30) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`FK_paciente_telefones_paciente\` (\`pac_codigo\`),
        CONSTRAINT \`FK_paciente_telefones_paciente\` FOREIGN KEY (\`pac_codigo\`) REFERENCES \`paciente\` (\`pac_codigo\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`plano_saucede\` (
        \`plan_codig\` int NOT NULL AUTO_INCREMENT,
        \`plano_descricao\` varchar(255) NOT NULL,
        \`plano_telefone\` varchar(30) NOT NULL,
        PRIMARY KEY (\`plan_codig\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`vinculo\` (
        \`vinculo_codigo\` int NOT NULL AUTO_INCREMENT,
        \`pac_codigo\` int NOT NULL,
        \`plan_codig\` int NOT NULL,
        \`nr_contrato\` varchar(100) NOT NULL,
        PRIMARY KEY (\`vinculo_codigo\`),
        UNIQUE KEY \`uq_vinculo_paciente_plano_contrato\` (\`pac_codigo\`, \`plan_codig\`, \`nr_contrato\`),
        KEY \`FK_vinculo_plano\` (\`plan_codig\`),
        CONSTRAINT \`FK_vinculo_paciente\` FOREIGN KEY (\`pac_codigo\`) REFERENCES \`paciente\` (\`pac_codigo\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_vinculo_plano\` FOREIGN KEY (\`plan_codig\`) REFERENCES \`plano_saucede\` (\`plan_codig\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`procedimento\` (
        \`proc_codigo\` int NOT NULL AUTO_INCREMENT,
        \`proc_nome\` varchar(255) NOT NULL,
        \`proc_valor\` decimal(12,2) NOT NULL,
        PRIMARY KEY (\`proc_codigo\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`consulta\` (
        \`cons_codigo\` int NOT NULL AUTO_INCREMENT,
        \`data\` date NOT NULL,
        \`hora\` time NOT NULL,
        \`particular\` tinyint(1) NOT NULL DEFAULT 0,
        \`pac_codigo\` int NOT NULL,
        \`med_codigo\` int NOT NULL,
        \`vinculo_codigo\` int NULL,
        PRIMARY KEY (\`cons_codigo\`),
        KEY \`FK_consulta_paciente\` (\`pac_codigo\`),
        KEY \`FK_consulta_medico\` (\`med_codigo\`),
        KEY \`FK_consulta_vinculo\` (\`vinculo_codigo\`),
        CONSTRAINT \`FK_consulta_paciente\` FOREIGN KEY (\`pac_codigo\`) REFERENCES \`paciente\` (\`pac_codigo\`),
        CONSTRAINT \`FK_consulta_medico\` FOREIGN KEY (\`med_codigo\`) REFERENCES \`medico\` (\`med_codigo\`),
        CONSTRAINT \`FK_consulta_vinculo\` FOREIGN KEY (\`vinculo_codigo\`) REFERENCES \`vinculo\` (\`vinculo_codigo\`) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`consulta_procedimento\` (
        \`cons_codigo\` int NOT NULL,
        \`proc_codigo\` int NOT NULL,
        PRIMARY KEY (\`cons_codigo\`, \`proc_codigo\`),
        KEY \`FK_consulta_procedimento_procedimento\` (\`proc_codigo\`),
        CONSTRAINT \`FK_consulta_procedimento_consulta\` FOREIGN KEY (\`cons_codigo\`) REFERENCES \`consulta\` (\`cons_codigo\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_consulta_procedimento_procedimento\` FOREIGN KEY (\`proc_codigo\`) REFERENCES \`procedimento\` (\`proc_codigo\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`consulta_procedimento\``);
    await queryRunner.query(`DROP TABLE \`consulta\``);
    await queryRunner.query(`DROP TABLE \`procedimento\``);
    await queryRunner.query(`DROP TABLE \`vinculo\``);
    await queryRunner.query(`DROP TABLE \`plano_saucede\``);
    await queryRunner.query(`DROP TABLE \`paciente_telefones\``);
    await queryRunner.query(`DROP TABLE \`paciente\``);
    await queryRunner.query(`DROP TABLE \`medico\``);
    await queryRunner.query(`DROP TABLE \`especialidade\``);
  }
}
