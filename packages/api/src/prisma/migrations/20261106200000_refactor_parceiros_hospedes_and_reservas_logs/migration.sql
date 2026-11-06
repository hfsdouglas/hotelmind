-- 1. Renomear parceiros_comerciais para parceiros
ALTER TABLE "parceiros_comerciais" RENAME TO "parceiros";

-- 2. Criar parceiros_enderecos e migrar dados
CREATE TABLE "parceiros_enderecos" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "parceiro_id" TEXT NOT NULL UNIQUE,
    "logradouro" VARCHAR(120),
    "numero" VARCHAR(20),
    "complemento" VARCHAR(50),
    "bairro" VARCHAR(60),
    "cidade" VARCHAR(60),
    "estado" VARCHAR(2),
    "cep" VARCHAR(10),
    "pais" VARCHAR(50) NOT NULL DEFAULT 'Brasil',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "parceiros_enderecos_parceiro_id_fkey" FOREIGN KEY ("parceiro_id") REFERENCES "parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "parceiros_enderecos_parceiro_id_idx" ON "parceiros_enderecos"("parceiro_id");

INSERT INTO "parceiros_enderecos" ("parceiro_id", "logradouro", "numero", "complemento", "bairro", "cidade", "estado", "cep", "pais", "created_at", "updated_at")
SELECT "id", "logradouro", "numero", "complemento", "bairro", "cidade", "estado", "cep", COALESCE("pais", 'Brasil'), "criado_em", "atualizado_em"
FROM "parceiros";

ALTER TABLE "parceiros"
  DROP COLUMN "logradouro",
  DROP COLUMN "numero",
  DROP COLUMN "complemento",
  DROP COLUMN "bairro",
  DROP COLUMN "cidade",
  DROP COLUMN "estado",
  DROP COLUMN "cep",
  DROP COLUMN "pais";

-- Atualizar FK de reservas para parceiro_id
ALTER TABLE "reservas" RENAME COLUMN "parceiro_comercial_id" TO "parceiro_id";

-- 3. Renomear reserva_hospedes para hospedes
ALTER TABLE "reserva_hospedes" RENAME TO "hospedes";

-- Criar hospedes_enderecos e migrar dados
CREATE TABLE "hospedes_enderecos" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "hospede_id" TEXT NOT NULL UNIQUE,
    "logradouro" VARCHAR(120),
    "numero_endereco" VARCHAR(20),
    "complemento" VARCHAR(50),
    "bairro" VARCHAR(60),
    "cidade" VARCHAR(60),
    "estado" VARCHAR(2),
    "cep" VARCHAR(10),
    "pais_residencia" VARCHAR(60),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hospedes_enderecos_hospede_id_fkey" FOREIGN KEY ("hospede_id") REFERENCES "hospedes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "hospedes_enderecos_hospede_id_idx" ON "hospedes_enderecos"("hospede_id");

INSERT INTO "hospedes_enderecos" ("hospede_id", "logradouro", "numero_endereco", "complemento", "bairro", "cidade", "estado", "cep", "pais_residencia")
SELECT "id", "logradouro", "numero_endereco", "complemento", "bairro", "cidade", "estado", "cep", "pais_residencia"
FROM "hospedes";

ALTER TABLE "hospedes"
  DROP COLUMN "logradouro",
  DROP COLUMN "numero_endereco",
  DROP COLUMN "complemento",
  DROP COLUMN "bairro",
  DROP COLUMN "cidade",
  DROP COLUMN "estado",
  DROP COLUMN "cep",
  DROP COLUMN "pais_residencia",
  DROP COLUMN "procedencia",
  DROP COLUMN "proximo_destino";

CREATE INDEX IF NOT EXISTS "hospedes_reserva_id_idx" ON "hospedes"("reserva_id");

-- 4. Criar reservas_logs e migrar reserva_status_historico
CREATE TABLE "reservas_logs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "reserva_id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "user_id" TEXT,
    "dados_hash" CHAR(64) NOT NULL,
    "dados_reserva" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reservas_logs_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "reservas_logs_reserva_id_idx" ON "reservas_logs"("reserva_id");
CREATE INDEX "reservas_logs_hotel_id_idx" ON "reservas_logs"("hotel_id");
CREATE INDEX "reservas_logs_reserva_id_created_at_idx" ON "reservas_logs"("reserva_id", "created_at");

-- Migrar dados de histórico calculando SHA-256 do JSON de status
INSERT INTO "reservas_logs" ("reserva_id", "hotel_id", "user_id", "dados_hash", "dados_reserva", "created_at")
SELECT
    h."reserva_id",
    r."hotel_id",
    h."user_id",
    encode(sha256(json_build_object('status', h."status_novo")::text::bytea), 'hex'),
    json_build_object('status', h."status_novo")::jsonb,
    h."created_at"
FROM "reserva_status_historico" h
JOIN "reservas" r ON r."id" = h."reserva_id";

DROP TABLE "reserva_status_historico";

-- AlterTable
ALTER TABLE "hospedes" RENAME CONSTRAINT "reserva_hospedes_pkey" TO "hospedes_pkey";

-- AlterTable
ALTER TABLE "hospedes_enderecos" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "parceiros" RENAME CONSTRAINT "parceiros_comerciais_pkey" TO "parceiros_pkey";

-- AlterTable
ALTER TABLE "parceiros_enderecos" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reservas_logs" ALTER COLUMN "id" DROP DEFAULT;

-- RenameForeignKey
ALTER TABLE "hospedes" RENAME CONSTRAINT "reserva_hospedes_reserva_id_fkey" TO "hospedes_reserva_id_fkey";

-- RenameForeignKey
ALTER TABLE "parceiros" RENAME CONSTRAINT "parceiros_comerciais_hotel_id_fkey" TO "parceiros_hotel_id_fkey";

-- RenameForeignKey
ALTER TABLE "reservas" RENAME CONSTRAINT "reservas_parceiro_comercial_id_fkey" TO "reservas_parceiro_id_fkey";

-- RenameIndex
ALTER INDEX "reserva_hospedes_reserva_id_posicao_key" RENAME TO "hospedes_reserva_id_posicao_key";

-- RenameIndex
ALTER INDEX "parceiros_comerciais_hotel_id_documento_key" RENAME TO "parceiros_hotel_id_documento_key";

-- RenameIndex
ALTER INDEX "parceiros_comerciais_hotel_id_idx" RENAME TO "parceiros_hotel_id_idx";

-- RenameIndex
ALTER INDEX "parceiros_comerciais_hotel_id_razao_social_idx" RENAME TO "parceiros_hotel_id_razao_social_idx";

-- RenameIndex
ALTER INDEX "parceiros_comerciais_hotel_id_status_idx" RENAME TO "parceiros_hotel_id_status_idx";

-- RenameIndex
ALTER INDEX "parceiros_comerciais_hotel_id_tipo_parceiro_idx" RENAME TO "parceiros_hotel_id_tipo_parceiro_idx";

-- RenameIndex
ALTER INDEX "reservas_parceiro_comercial_id_idx" RENAME TO "reservas_parceiro_id_idx";
