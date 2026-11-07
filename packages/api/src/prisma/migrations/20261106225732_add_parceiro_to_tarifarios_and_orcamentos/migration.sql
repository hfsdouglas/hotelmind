-- AlterTable
ALTER TABLE "orcamentos" ADD COLUMN     "parceiro_id" TEXT;

-- AlterTable
ALTER TABLE "tarifarios" ADD COLUMN     "parceiro_id" TEXT;

-- CreateIndex
CREATE INDEX "orcamentos_parceiro_id_idx" ON "orcamentos"("parceiro_id");

-- CreateIndex
CREATE INDEX "tarifarios_parceiro_id_idx" ON "tarifarios"("parceiro_id");

-- CreateIndex
CREATE INDEX "tarifarios_hotel_id_parceiro_id_ativo_idx" ON "tarifarios"("hotel_id", "parceiro_id", "ativo");

-- AddForeignKey
ALTER TABLE "tarifarios" ADD CONSTRAINT "tarifarios_parceiro_id_fkey" FOREIGN KEY ("parceiro_id") REFERENCES "parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_parceiro_id_fkey" FOREIGN KEY ("parceiro_id") REFERENCES "parceiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;
