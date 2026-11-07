-- AlterTable
ALTER TABLE "tarifarios" ADD COLUMN     "minimo_diarias" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "categoria_quarto_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "tarifarios_categorias_quartos" (
    "id" TEXT NOT NULL,
    "tarifario_id" TEXT NOT NULL,
    "categoria_quarto_id" TEXT NOT NULL,

    CONSTRAINT "tarifarios_categorias_quartos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tarifarios_categorias_quartos_tarifario_id_idx" ON "tarifarios_categorias_quartos"("tarifario_id");

-- CreateIndex
CREATE INDEX "tarifarios_categorias_quartos_categoria_quarto_id_idx" ON "tarifarios_categorias_quartos"("categoria_quarto_id");

-- CreateIndex
CREATE UNIQUE INDEX "tarifarios_categorias_quartos_tarifario_id_categoria_quarto_key" ON "tarifarios_categorias_quartos"("tarifario_id", "categoria_quarto_id");

-- AddForeignKey
ALTER TABLE "tarifarios_categorias_quartos" ADD CONSTRAINT "tarifarios_categorias_quartos_tarifario_id_fkey" FOREIGN KEY ("tarifario_id") REFERENCES "tarifarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifarios_categorias_quartos" ADD CONSTRAINT "tarifarios_categorias_quartos_categoria_quarto_id_fkey" FOREIGN KEY ("categoria_quarto_id") REFERENCES "categorias_quartos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill existing single-category tarifarios into the new association table
INSERT INTO "tarifarios_categorias_quartos" ("id", "tarifario_id", "categoria_quarto_id")
SELECT gen_random_uuid()::text, "id", "categoria_quarto_id"
FROM "tarifarios"
WHERE "categoria_quarto_id" IS NOT NULL
ON CONFLICT ("tarifario_id", "categoria_quarto_id") DO NOTHING;

