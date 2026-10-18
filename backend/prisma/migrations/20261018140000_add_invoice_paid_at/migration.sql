-- AlterTable
ALTER TABLE "invoices" ADD COLUMN "paid_at" TIMESTAMP(3);

-- Backfill: the last update of an already PAID invoice is the best available guess for its payment date
UPDATE "invoices" SET "paid_at" = "updated_at" WHERE "status" = 'PAID';

-- CreateIndex
CREATE INDEX "invoices_user_id_paid_at_idx" ON "invoices"("user_id", "paid_at");
