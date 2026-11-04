-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "telefone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "regime_alimentacao_id" TEXT NOT NULL,
    "categoria_quarto_id" TEXT NOT NULL,
    "check_in" VARCHAR(10) NOT NULL,
    "check_out" VARCHAR(10) NOT NULL,
    "quantidade_adultos" INTEGER NOT NULL DEFAULT 1,
    "quantidade_criancas" INTEGER NOT NULL DEFAULT 0,
    "quantidade_pets" INTEGER NOT NULL DEFAULT 0,
    "valor_total" VARCHAR(20) NOT NULL,
    "detalhamento_noites" JSONB NOT NULL,
    "token_publico" VARCHAR(64) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_hotel_id_idx" ON "leads"("hotel_id");

-- CreateIndex
CREATE INDEX "leads_hotel_id_email_idx" ON "leads"("hotel_id", "email");

-- CreateIndex
CREATE INDEX "leads_hotel_id_telefone_idx" ON "leads"("hotel_id", "telefone");

-- CreateIndex
CREATE UNIQUE INDEX "orcamentos_token_publico_key" ON "orcamentos"("token_publico");

-- CreateIndex
CREATE INDEX "orcamentos_hotel_id_idx" ON "orcamentos"("hotel_id");

-- CreateIndex
CREATE INDEX "orcamentos_hotel_id_status_idx" ON "orcamentos"("hotel_id", "status");

-- CreateIndex
CREATE INDEX "orcamentos_lead_id_idx" ON "orcamentos"("lead_id");

-- CreateIndex
CREATE INDEX "orcamentos_token_publico_idx" ON "orcamentos"("token_publico");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_regime_alimentacao_id_fkey" FOREIGN KEY ("regime_alimentacao_id") REFERENCES "regimes_alimentacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_categoria_quarto_id_fkey" FOREIGN KEY ("categoria_quarto_id") REFERENCES "categorias_quartos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
