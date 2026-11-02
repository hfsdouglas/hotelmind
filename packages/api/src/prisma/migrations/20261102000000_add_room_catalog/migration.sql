CREATE TABLE "categorias_quartos" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "hotel_id" TEXT NOT NULL,
  "nome" VARCHAR(100) NOT NULL,
  "status" CHAR(1) NOT NULL DEFAULT 'S',
  CONSTRAINT "categorias_quartos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quartos" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "hotel_id" TEXT NOT NULL,
  "categoria_id" TEXT NOT NULL,
  "identificacao" VARCHAR(30) NOT NULL,
  "limite_hospedes" INTEGER NOT NULL,
  CONSTRAINT "quartos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quartos_camas" (
  "id" TEXT NOT NULL,
  "quarto_id" TEXT NOT NULL,
  "tipo" VARCHAR(30) NOT NULL,
  "quantidade" INTEGER NOT NULL,
  CONSTRAINT "quartos_camas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categorias_quartos_hotel_id_nome_key" ON "categorias_quartos"("hotel_id", "nome");
CREATE INDEX "categorias_quartos_hotel_id_idx" ON "categorias_quartos"("hotel_id");
CREATE UNIQUE INDEX "quartos_hotel_id_identificacao_key" ON "quartos"("hotel_id", "identificacao");
CREATE INDEX "quartos_hotel_id_idx" ON "quartos"("hotel_id");
CREATE INDEX "quartos_categoria_id_idx" ON "quartos"("categoria_id");
CREATE UNIQUE INDEX "quartos_camas_quarto_id_tipo_key" ON "quartos_camas"("quarto_id", "tipo");
CREATE INDEX "quartos_camas_quarto_id_idx" ON "quartos_camas"("quarto_id");

ALTER TABLE "categorias_quartos" ADD CONSTRAINT "categorias_quartos_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quartos" ADD CONSTRAINT "quartos_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quartos" ADD CONSTRAINT "quartos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_quartos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quartos_camas" ADD CONSTRAINT "quartos_camas_quarto_id_fkey" FOREIGN KEY ("quarto_id") REFERENCES "quartos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
