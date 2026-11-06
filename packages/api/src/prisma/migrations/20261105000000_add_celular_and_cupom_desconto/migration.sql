-- AlterTable
ALTER TABLE "hoteis" ADD COLUMN IF NOT EXISTS "celular" VARCHAR(20);

-- AlterTable
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "cupom_desconto" VARCHAR(50);
