-- CreateTable
CREATE TABLE "regimes_alimentacao" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "cor_pulseira" VARCHAR(20) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regimes_alimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "regimes_alimentacao_hotel_id_idx" ON "regimes_alimentacao"("hotel_id");

-- CreateIndex
CREATE INDEX "regimes_alimentacao_hotel_id_ativo_idx" ON "regimes_alimentacao"("hotel_id", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "regimes_alimentacao_hotel_id_titulo_key" ON "regimes_alimentacao"("hotel_id", "titulo");

-- AddForeignKey
ALTER TABLE "regimes_alimentacao" ADD CONSTRAINT "regimes_alimentacao_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
