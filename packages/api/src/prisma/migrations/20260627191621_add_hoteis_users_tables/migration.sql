-- CreateTable
CREATE TABLE "hoteis" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "nome_hotel" VARCHAR(100) NOT NULL,
    "razao_social" VARCHAR(100) NOT NULL,
    "nome_fantasia" VARCHAR(100) NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "email_comercial" VARCHAR(255) NOT NULL,
    "telefone_comercial" VARCHAR(11) NOT NULL,
    "website" TEXT,

    CONSTRAINT "hoteis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hoteis_enderecos" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "rua" VARCHAR(100) NOT NULL,
    "numero" VARCHAR(10) NOT NULL,
    "bairro" VARCHAR(50) NOT NULL,
    "complemento" TEXT,
    "cep" VARCHAR(8) NOT NULL,
    "cidade" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(2) NOT NULL,

    CONSTRAINT "hoteis_enderecos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "nome_completo" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" TEXT NOT NULL,
    "nascimento" DATE NOT NULL,
    "genero" VARCHAR(20) NOT NULL,
    "celular" VARCHAR(20) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "rg" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hoteis_cnpj_key" ON "hoteis"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "hoteis_email_comercial_key" ON "hoteis"("email_comercial");

-- CreateIndex
CREATE INDEX "hoteis_enderecos_hotel_id_idx" ON "hoteis_enderecos"("hotel_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_celular_key" ON "users"("celular");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_rg_key" ON "users"("rg");

-- CreateIndex
CREATE INDEX "users_hotel_id_idx" ON "users"("hotel_id");

-- AddForeignKey
ALTER TABLE "hoteis_enderecos" ADD CONSTRAINT "hoteis_enderecos_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
