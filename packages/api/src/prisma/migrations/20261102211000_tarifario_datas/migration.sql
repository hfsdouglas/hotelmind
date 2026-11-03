-- Drop exclusion constraint and period columns from tarifarios
ALTER TABLE "tarifarios" DROP CONSTRAINT IF EXISTS "tarifarios_sem_sobreposicao_ativa_excl";
ALTER TABLE "tarifarios" DROP CONSTRAINT IF EXISTS "tarifarios_periodo_valido_chk";
ALTER TABLE "tarifarios" DROP CONSTRAINT IF EXISTS "tarifarios_no_overlapping_active_periods";
ALTER TABLE "tarifarios" DROP CONSTRAINT IF EXISTS "tarifarios_valid_period_check";
DROP INDEX IF EXISTS "tarifarios_hotel_id_categoria_quarto_id_data_inicio_data_fi_idx";
ALTER TABLE "tarifarios" DROP COLUMN IF EXISTS "data_inicio" CASCADE;
ALTER TABLE "tarifarios" DROP COLUMN IF EXISTS "data_fim" CASCADE;

-- CreateTable
CREATE TABLE IF NOT EXISTS "tarifarios_datas" (
    "id" TEXT NOT NULL,
    "tarifario_id" TEXT NOT NULL,
    "data" DATE NOT NULL,

    CONSTRAINT "tarifarios_datas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tarifarios_datas_tarifario_id_idx" ON "tarifarios_datas"("tarifario_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tarifarios_datas_data_idx" ON "tarifarios_datas"("data");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tarifarios_datas_tarifario_id_data_key" ON "tarifarios_datas"("tarifario_id", "data");

-- AddForeignKey
ALTER TABLE "tarifarios_datas" DROP CONSTRAINT IF EXISTS "tarifarios_datas_tarifario_id_fkey";
ALTER TABLE "tarifarios_datas" ADD CONSTRAINT "tarifarios_datas_tarifario_id_fkey" FOREIGN KEY ("tarifario_id") REFERENCES "tarifarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
