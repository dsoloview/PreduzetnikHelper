-- CreateTable
CREATE TABLE "tax_obligations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_account" TEXT NOT NULL,
    "payment_code" TEXT NOT NULL DEFAULT '253',
    "model" TEXT NOT NULL DEFAULT '97',
    "reference" TEXT NOT NULL,
    "purpose" TEXT,
    "start_year" INTEGER NOT NULL,
    "start_month" INTEGER NOT NULL,
    "end_year" INTEGER,
    "end_month" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "obligation_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tax_obligations_user_id_idx" ON "tax_obligations"("user_id");

-- CreateIndex
CREATE INDEX "tax_payments_user_id_year_idx" ON "tax_payments"("user_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "tax_payments_obligation_id_year_month_key" ON "tax_payments"("obligation_id", "year", "month");

-- AddForeignKey
ALTER TABLE "tax_obligations" ADD CONSTRAINT "tax_obligations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "tax_obligations"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
