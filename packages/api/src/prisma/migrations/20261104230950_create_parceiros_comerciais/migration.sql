-- CreateTable
CREATE TABLE "parceiros_comerciais" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "tipo_parceiro" VARCHAR(30) NOT NULL,
    "tipo_pessoa" CHAR(2) NOT NULL,
    "razao_social" VARCHAR(150) NOT NULL,
    "nome_fantasia" VARCHAR(150),
    "documento" VARCHAR(20),
    "inscricao_estadual" VARCHAR(30),
    "estrangeiro" BOOLEAN NOT NULL DEFAULT false,
    "cadastur" VARCHAR(30),
    "codigo_iata" VARCHAR(20),
    "registro_embratur" VARCHAR(30),
    "logradouro" VARCHAR(120),
    "numero" VARCHAR(20),
    "complemento" VARCHAR(50),
    "bairro" VARCHAR(60),
    "cidade" VARCHAR(60),
    "estado" VARCHAR(2),
    "cep" VARCHAR(10),
    "pais" VARCHAR(50) NOT NULL DEFAULT 'Brasil',
    "modelo_tarifario" VARCHAR(20) NOT NULL DEFAULT 'comissionada',
    "comissao_padrao" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "politica_faturamento" VARCHAR(20) NOT NULL DEFAULT 'prepago',
    "prazo_pagamento_dias" INTEGER NOT NULL DEFAULT 0,
    "limite_credito" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "allotment_quartos" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ativo',
    "motivo_bloqueio" TEXT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parceiros_comerciais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parceiros_contatos" (
    "id" TEXT NOT NULL,
    "parceiro_id" TEXT NOT NULL,
    "tipo_contato" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "telefone" VARCHAR(30) NOT NULL,
    "cargo" VARCHAR(50),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parceiros_contatos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parceiros_comerciais_hotel_id_idx" ON "parceiros_comerciais"("hotel_id");

-- CreateIndex
CREATE INDEX "parceiros_comerciais_hotel_id_tipo_parceiro_idx" ON "parceiros_comerciais"("hotel_id", "tipo_parceiro");

-- CreateIndex
CREATE INDEX "parceiros_comerciais_hotel_id_status_idx" ON "parceiros_comerciais"("hotel_id", "status");

-- CreateIndex
CREATE INDEX "parceiros_comerciais_hotel_id_razao_social_idx" ON "parceiros_comerciais"("hotel_id", "razao_social");

-- CreateIndex
CREATE UNIQUE INDEX "parceiros_comerciais_hotel_id_documento_key" ON "parceiros_comerciais"("hotel_id", "documento");

-- CreateIndex
CREATE INDEX "parceiros_contatos_parceiro_id_idx" ON "parceiros_contatos"("parceiro_id");

-- CreateIndex
CREATE INDEX "parceiros_contatos_parceiro_id_tipo_contato_idx" ON "parceiros_contatos"("parceiro_id", "tipo_contato");

-- AddForeignKey
ALTER TABLE "parceiros_comerciais" ADD CONSTRAINT "parceiros_comerciais_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parceiros_contatos" ADD CONSTRAINT "parceiros_contatos_parceiro_id_fkey" FOREIGN KEY ("parceiro_id") REFERENCES "parceiros_comerciais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
