import { MigrationInterface, QueryRunner } from "typeorm";

export class database1650299510863 implements MigrationInterface {
    name = 'database1650299510863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "username" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "location" ("name" varchar PRIMARY KEY NOT NULL, "id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "plan" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" datetime NOT NULL, "status" varchar NOT NULL, "userId" integer, "locationName" varchar)`);
        await queryRunner.query(`CREATE TABLE "temporary_plan" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" datetime NOT NULL, "status" varchar NOT NULL, "userId" integer, "locationName" varchar, CONSTRAINT "FK_827493784de956d80a17369b2c0" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_34fe916eeb62ad14ee3db26eb1c" FOREIGN KEY ("locationName") REFERENCES "location" ("name") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_plan"("id", "date", "status", "userId", "locationName") SELECT "id", "date", "status", "userId", "locationName" FROM "plan"`);
        await queryRunner.query(`DROP TABLE "plan"`);
        await queryRunner.query(`ALTER TABLE "temporary_plan" RENAME TO "plan"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan" RENAME TO "temporary_plan"`);
        await queryRunner.query(`CREATE TABLE "plan" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" datetime NOT NULL, "status" varchar NOT NULL, "userId" integer, "locationName" varchar)`);
        await queryRunner.query(`INSERT INTO "plan"("id", "date", "status", "userId", "locationName") SELECT "id", "date", "status", "userId", "locationName" FROM "temporary_plan"`);
        await queryRunner.query(`DROP TABLE "temporary_plan"`);
        await queryRunner.query(`DROP TABLE "plan"`);
        await queryRunner.query(`DROP TABLE "location"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
