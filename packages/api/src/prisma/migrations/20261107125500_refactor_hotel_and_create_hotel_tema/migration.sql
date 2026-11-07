-- DropForeignKey
ALTER TABLE "hoteis_configuracoes" DROP CONSTRAINT "hoteis_configuracoes_hotel_id_fkey";

-- AlterTable
ALTER TABLE "hoteis" ADD COLUMN     "aceita_pets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "categoria" VARCHAR(50) NOT NULL DEFAULT 'HOTEL',
ADD COLUMN     "classificacao_estrelas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cobertura_estacionamento" VARCHAR(20) NOT NULL DEFAULT 'DESCOBERTO',
ADD COLUMN     "descricao_completa" TEXT,
ADD COLUMN     "descricao_curta" VARCHAR(160),
ADD COLUMN     "estacionamento_reserva_previa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exibir_wifi_voucher" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "horario_abertura_recepcao" VARCHAR(5),
ADD COLUMN     "horario_checkin" VARCHAR(5) NOT NULL DEFAULT '14:00',
ADD COLUMN     "horario_checkout" VARCHAR(5) NOT NULL DEFAULT '12:00',
ADD COLUMN     "horario_fechamento_recepcao" VARCHAR(5),
ADD COLUMN     "limite_idade_crianca_gratis" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "nome_rede_wifi" VARCHAR(100),
ADD COLUMN     "permite_fumar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "peso_maximo_pet_kg" DECIMAL(5,2),
ADD COLUMN     "possui_wifi" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quantidade_max_criancas_gratis" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "recepcao_24h" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "senha_rede_wifi" VARCHAR(100),
ADD COLUMN     "taxa_higienizacao_fumo" DECIMAL(10,2),
ADD COLUMN     "tipo_estacionamento" VARCHAR(30) NOT NULL DEFAULT 'NAO_POSSUI',
ADD COLUMN     "tipo_wifi" VARCHAR(30) NOT NULL DEFAULT 'GRATUITO_TOTAL',
ADD COLUMN     "valor_diaria_estacionamento" DECIMAL(10,2);

-- DropTable
DROP TABLE "hoteis_configuracoes";

-- CreateTable
CREATE TABLE "hoteis_temas" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "logo_principal" TEXT,
    "logo_escuro" TEXT,
    "favicon" TEXT,
    "cor_primaria" VARCHAR(7) NOT NULL DEFAULT '#1e40af',
    "cor_secundaria" VARCHAR(7) NOT NULL DEFAULT '#64748b',
    "cor_fundo" VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    "cor_superficie" VARCHAR(7) NOT NULL DEFAULT '#f8fafc',
    "cor_texto_principal" VARCHAR(7) NOT NULL DEFAULT '#0f172a',
    "cor_texto_secundario" VARCHAR(7) NOT NULL DEFAULT '#475569',
    "cor_destaque" VARCHAR(7) NOT NULL DEFAULT '#f59e0b',

    CONSTRAINT "hoteis_temas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hoteis_temas_hotel_id_key" ON "hoteis_temas"("hotel_id");

-- CreateIndex
CREATE INDEX "hoteis_temas_hotel_id_idx" ON "hoteis_temas"("hotel_id");

-- AddForeignKey
ALTER TABLE "hoteis_temas" ADD CONSTRAINT "hoteis_temas_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
