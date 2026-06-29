-- AlterTable
ALTER TABLE "users" ADD COLUMN     "grupos_ids" TEXT;

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "grupo" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "status" CHAR(1) NOT NULL DEFAULT 'S',

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotas" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "modulo" VARCHAR(100) NOT NULL,
    "recurso" VARCHAR(100) NOT NULL,
    "rota" VARCHAR(255) NOT NULL,
    "icone" VARCHAR(50),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotas_hoteis" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "rota_id" TEXT NOT NULL,

    CONSTRAINT "rotas_hoteis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_rotas" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "rota_id" TEXT NOT NULL,

    CONSTRAINT "grupos_rotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grupos_hotel_id_idx" ON "grupos"("hotel_id");

-- CreateIndex
CREATE INDEX "grupos_grupo_idx" ON "grupos"("grupo");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_hotel_id_grupo_key" ON "grupos"("hotel_id", "grupo");

-- CreateIndex
CREATE INDEX "rotas_hoteis_hotel_id_idx" ON "rotas_hoteis"("hotel_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotas_hoteis_hotel_id_rota_id_key" ON "rotas_hoteis"("hotel_id", "rota_id");

-- CreateIndex
CREATE INDEX "grupos_rotas_grupo_id_idx" ON "grupos_rotas"("grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_rotas_grupo_id_rota_id_key" ON "grupos_rotas"("grupo_id", "rota_id");

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotas_hoteis" ADD CONSTRAINT "rotas_hoteis_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotas_hoteis" ADD CONSTRAINT "rotas_hoteis_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_rotas" ADD CONSTRAINT "grupos_rotas_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_rotas" ADD CONSTRAINT "grupos_rotas_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
