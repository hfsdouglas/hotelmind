/*
  Warnings:

  - Made the column `regime_alimentacao_id` on table `tarifarios` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "tarifarios" DROP CONSTRAINT "tarifarios_regime_alimentacao_id_fkey";

-- AlterTable
ALTER TABLE "tarifarios" ALTER COLUMN "regime_alimentacao_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "tarifarios" ADD CONSTRAINT "tarifarios_regime_alimentacao_id_fkey" FOREIGN KEY ("regime_alimentacao_id") REFERENCES "regimes_alimentacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
