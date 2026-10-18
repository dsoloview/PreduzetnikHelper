-- DropIndex
DROP INDEX "users_mbr_key";

-- DropIndex
DROP INDEX "users_pib_key";

-- CreateIndex
CREATE INDEX "invoices_user_id_year_status_idx" ON "invoices"("user_id", "year", "status");

-- CreateIndex
CREATE INDEX "invoices_user_id_issue_date_idx" ON "invoices"("user_id", "issue_date");
