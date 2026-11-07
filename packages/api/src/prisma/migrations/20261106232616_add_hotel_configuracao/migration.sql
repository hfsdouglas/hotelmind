-- CreateTable
CREATE TABLE "hoteis_configuracoes" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "categoria" VARCHAR(50) NOT NULL DEFAULT 'HOTEL',
    "classificacao_estrelas" INTEGER NOT NULL DEFAULT 0,
    "descricao_curta" VARCHAR(160),
    "descricao_completa" TEXT,
    "logo_primary" TEXT,
    "logo_dark" TEXT,
    "favicon" TEXT,
    "color_primary" VARCHAR(7) NOT NULL DEFAULT '#1e40af',
    "color_secondary" VARCHAR(7) NOT NULL DEFAULT '#64748b',
    "color_background" VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    "color_surface" VARCHAR(7) NOT NULL DEFAULT '#f8fafc',
    "color_text_primary" VARCHAR(7) NOT NULL DEFAULT '#0f172a',
    "color_text_secondary" VARCHAR(7) NOT NULL DEFAULT '#475569',
    "color_accent" VARCHAR(7) NOT NULL DEFAULT '#f59e0b',
    "free_child_age_limit" INTEGER NOT NULL DEFAULT 5,
    "free_child_max_per_room" INTEGER NOT NULL DEFAULT 1,
    "checkin_time" VARCHAR(5) NOT NULL DEFAULT '14:00',
    "checkout_time" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "reception_24h" BOOLEAN NOT NULL DEFAULT true,
    "reception_opening_time" VARCHAR(5),
    "reception_closing_time" VARCHAR(5),
    "pet_friendly" BOOLEAN NOT NULL DEFAULT false,
    "pet_max_weight_kg" DECIMAL(5,2),
    "smoking_allowed" BOOLEAN NOT NULL DEFAULT false,
    "smoking_sanitization_fee" DECIMAL(10,2),
    "parking_type" VARCHAR(30) NOT NULL DEFAULT 'NAO_POSSUI',
    "parking_fee_per_day" DECIMAL(10,2),
    "parking_reservation_required" BOOLEAN NOT NULL DEFAULT false,
    "parking_covered" VARCHAR(20) NOT NULL DEFAULT 'DESCOBERTO',
    "wifi_available" BOOLEAN NOT NULL DEFAULT true,
    "wifi_type" VARCHAR(30) NOT NULL DEFAULT 'GRATUITO_TOTAL',
    "wifi_ssid_default" VARCHAR(100),
    "wifi_password_default" VARCHAR(100),
    "wifi_show_on_voucher" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hoteis_configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hoteis_configuracoes_hotel_id_key" ON "hoteis_configuracoes"("hotel_id");

-- CreateIndex
CREATE INDEX "hoteis_configuracoes_hotel_id_idx" ON "hoteis_configuracoes"("hotel_id");

-- AddForeignKey
ALTER TABLE "hoteis_configuracoes" ADD CONSTRAINT "hoteis_configuracoes_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hoteis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
