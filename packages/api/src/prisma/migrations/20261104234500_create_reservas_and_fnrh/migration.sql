-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "titular_nome" VARCHAR(150) NOT NULL,
    "titular_telefone" VARCHAR(30),
    "titular_email" VARCHAR(150),
    "quarto_id" TEXT NOT NULL,
    "regime_alimentacao_id" TEXT NOT NULL,
    "parceiro_comercial_id" TEXT,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "quantidade_adultos" INTEGER NOT NULL,
    "quantidade_criancas" INTEGER NOT NULL DEFAULT 0,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "detalhamento_diarias" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'a_confirmar',
    "token_fnrh" VARCHAR(64) NOT NULL,
    "token_fnrh_ativo" BOOLEAN NOT NULL DEFAULT true,
    "fnrh_enviada_em" TIMESTAMP(3),
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_hospedes" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL,
    "ficha_status" VARCHAR(12) NOT NULL DEFAULT 'pendente',
    "preenchido_por" VARCHAR(10),
    "preenchido_em" TIMESTAMP(3),
    "nome_completo" VARCHAR(150),
    "nacionalidade" VARCHAR(60),
    "data_nascimento" DATE,
    "sexo" VARCHAR(15),
    "profissao" VARCHAR(80),
    "tipo_documento" VARCHAR(15),
    "numero_documento" VARCHAR(30),
    "logradouro" VARCHAR(120),
    "numero_endereco" VARCHAR(20),
    "complemento" VARCHAR(50),
    "bairro" VARCHAR(60),
    "cidade" VARCHAR(60),
    "estado" VARCHAR(2),
    "cep" VARCHAR(10),
    "pais_residencia" VARCHAR(60),
    "telefone" VARCHAR(30),
    "email" VARCHAR(150),
    "motivo_viagem" VARCHAR(30),
    "meio_transporte" VARCHAR(30),
    "procedencia" VARCHAR(100),
    "proximo_destino" VARCHAR(100),
    "responsavel_posicao" INTEGER,

    CONSTRAINT "reserva_hospedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_status_historico" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "status_anterior" VARCHAR(20),
    "status_novo" VARCHAR(20) NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reserva_status_historico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservas_token_fnrh_key" ON "reservas"("token_fnrh");

-- CreateIndex
CREATE INDEX "reservas_hotel_id_idx" ON "reservas"("hotel_id");

-- CreateIndex
CREATE INDEX "reservas_hotel_id_status_idx" ON "reservas"("hotel_id", "status");

-- CreateIndex
CREATE INDEX "reservas_hotel_id_check_in_idx" ON "reservas"("hotel_id", "check_in");

-- CreateIndex
CREATE INDEX "reservas_quarto_id_check_in_check_out_idx" ON "reservas"("quarto_id", "check_in", "check_out");

-- CreateIndex
CREATE INDEX "reservas_parceiro_comercial_id_idx" ON "reservas"("parceiro_comercial_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_hotel_id_codigo_key" ON "reservas"("hotel_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "reserva_hospedes_reserva_id_posicao_key" ON "reserva_hospedes"("reserva_id", "posicao");

-- CreateIndex
CREATE INDEX "reserva_status_historico_reserva_id_idx" ON "reserva_status_historico"("reserva_id");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_quarto_id_fkey" FOREIGN KEY ("quarto_id") REFERENCES "quartos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_regime_alimentacao_id_fkey" FOREIGN KEY ("regime_alimentacao_id") REFERENCES "regimes_alimentacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_parceiro_comercial_id_fkey" FOREIGN KEY ("parceiro_comercial_id") REFERENCES "parceiros_comerciais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_hospedes" ADD CONSTRAINT "reserva_hospedes_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_status_historico" ADD CONSTRAINT "reserva_status_historico_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Extension and Exclusion Constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "reservas" ADD CONSTRAINT "reservas_sem_conflito_quarto"
  EXCLUDE USING gist (
    "quarto_id" WITH =,
    daterange("check_in", "check_out", '[)') WITH &&
  ) WHERE ("status" IN ('a_confirmar', 'confirmada', 'check_in', 'check_out'));

ALTER TABLE "reservas" ADD CONSTRAINT "reservas_periodo_valido" CHECK ("check_out" > "check_in");
