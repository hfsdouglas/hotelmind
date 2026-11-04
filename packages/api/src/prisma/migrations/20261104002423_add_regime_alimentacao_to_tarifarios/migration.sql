-- AlterTable
ALTER TABLE "tarifarios" ADD COLUMN     "regime_alimentacao_id" TEXT;

-- CreateIndex
CREATE INDEX "tarifarios_regime_alimentacao_id_idx" ON "tarifarios"("regime_alimentacao_id");

-- AddForeignKey
ALTER TABLE "tarifarios" ADD CONSTRAINT "tarifarios_regime_alimentacao_id_fkey" FOREIGN KEY ("regime_alimentacao_id") REFERENCES "regimes_alimentacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
