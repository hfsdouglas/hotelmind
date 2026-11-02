CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE "tarifarios" (
  "id" TEXT NOT NULL,
  "hotel_id" TEXT NOT NULL,
  "categoria_quarto_id" TEXT NOT NULL,
  "nome" VARCHAR(100) NOT NULL,
  "data_inicio" DATE NOT NULL,
  "data_fim" DATE NOT NULL,
  "valor_diaria" NUMERIC(12, 2) NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tarifarios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tarifarios_datas_validas_check" CHECK ("data_inicio" < "data_fim"),
  CONSTRAINT "tarifarios_valor_diaria_positivo_check" CHECK ("valor_diaria" >= 0),
  CONSTRAINT "tarifarios_sem_sobreposicao_ativa_excl" EXCLUDE USING gist (
    "hotel_id" WITH =,
    "categoria_quarto_id" WITH =,
    daterange("data_inicio", "data_fim", '[)') WITH &&
  ) WHERE ("ativo" = true)
);

CREATE INDEX "tarifarios_hotel_id_idx" ON "tarifarios"("hotel_id");
CREATE INDEX "tarifarios_categoria_quarto_id_idx" ON "tarifarios"("categoria_quarto_id");
CREATE INDEX "tarifarios_hotel_id_categoria_quarto_id_ativo_idx" ON "tarifarios"("hotel_id", "categoria_quarto_id", "ativo");
CREATE INDEX "tarifarios_hotel_id_categoria_quarto_id_data_inicio_data_fi_idx" ON "tarifarios"("hotel_id", "categoria_quarto_id", "data_inicio", "data_fim");

ALTER TABLE "tarifarios" ADD CONSTRAINT "tarifarios_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tarifarios" ADD CONSTRAINT "tarifarios_categoria_quarto_id_fkey" FOREIGN KEY ("categoria_quarto_id") REFERENCES "categorias_quartos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
