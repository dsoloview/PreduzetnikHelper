# Feature Proposals — PreduzetnikHelper

> Analysis of existing functionality and proposals for new features useful for a Serbian paušalac.

## What's Already Built

| Module          | Functionality                                                                 |
|-----------------|-------------------------------------------------------------------------------|
| Auth            | Register, Login, JWT                                                          |
| Profile         | Company info (PIB, MBR, activity code, address, municipality)                 |
| Clients         | CRUD, domestic/international, tax ID, registration number                     |
| Bank Accounts   | CRUD, multi-currency (RSD/EUR/USD), SWIFT, IBAN, default account              |
| Invoices        | CRUD, status flow (DRAFT → SENT → PAID / CANCELLED), items, auto-numbering   |
| PDF             | Invoice PDF, KPO PDF (Puppeteer + Handlebars)                                 |
| KPO Book        | Auto-generated from invoices, PDF export                                      |
| Limits          | Pausal limit (6M RSD/year), VAT limit (8M RSD/365 days, domestic only)        |
| Dashboard       | Revenue stats, limit cards, status breakdown, recent invoices, top clients    |
| Settings        | Change password                                                               |

---

## Proposed Features

### 🔴 Priority: High

#### 1. IPS QR Code on Invoices
Generate an IPS QR code (NBS standard) on each invoice PDF so clients can scan and pay instantly via their banking app. Eliminates manual entry of payment details.

- **Scope**: Backend (QR generation library), PDF template update
- **Complexity**: Low-Medium
- **Value**: Clients pay faster, fewer errors in payment references

#### 2. NBS Exchange Rate Auto-Fetch
Fetch the official middle exchange rate from the National Bank of Serbia API (`webservices.nbs.rs`) when creating a foreign-currency invoice, instead of requiring manual input.

- **Scope**: Backend service + frontend auto-fill
- **Complexity**: Low
- **Value**: Eliminates manual work and ensures legally correct rates

#### 3. Recurring Invoices
Allow defining recurring invoice templates (monthly/weekly) that auto-generate DRAFT invoices on a schedule. Essential for retainer-based freelancers.

- **Scope**: New entity `RecurringInvoice`, CRON job (NestJS `@nestjs/schedule`)
- **Complexity**: Medium
- **Value**: Saves significant time for users with regular clients

#### 4. Invoice Email Sending
Send invoice PDFs directly to clients via email from the app. Include a professional email template with the PDF attachment.

- **Scope**: Backend (Nodemailer / Resend), frontend send button
- **Complexity**: Medium
- **Value**: Streamlines the invoicing workflow end-to-end

#### 5. Overdue Invoice Alerts
Show overdue invoices (past `dueDate`, status still SENT) prominently on the dashboard. Optionally send email reminders.

- **Scope**: Frontend dashboard widget + optional backend CRON
- **Complexity**: Low
- **Value**: Improves cash flow by reducing forgotten payments

#### 6. Data Export (CSV / Excel)
Export invoices, KPO book, and client list to CSV/XLSX. Critical for sharing data with an accountant at tax time.

- **Scope**: Backend endpoints returning file streams
- **Complexity**: Low
- **Value**: Every paušalac needs to share data with their accountant

---

### 🟡 Priority: Medium

#### 7. Tax Payment Calendar & Reminders
Display a calendar with Serbian tax deadlines for paušalci:
- Monthly fixed tax payment — due by 15th of following month
- Annual tax return (PPDG-1R) — due by May 15th
- Annual financial report — due by June 30th

- **Scope**: Static calendar data + notification system
- **Complexity**: Medium
- **Value**: Prevents missed deadlines and penalties

#### 8. Expense Tracking
Track business expenses (software subscriptions, coworking, equipment) even though paušalci can't deduct them. Helps understand actual profit.

- **Scope**: New entity `Expense` with categories, amounts, dates, receipt upload
- **Complexity**: Medium
- **Value**: Real profitability insight, useful if transitioning to bookkeeping-based taxation

#### 9. Limit Warning Notifications
Push/email alerts when approaching the 6M RSD pausal or 8M RSD VAT threshold (e.g., at 80%, 90%, 95%).

- **Scope**: Backend check on invoice creation + notification service
- **Complexity**: Low-Medium
- **Value**: Prevents accidental loss of paušalac status

#### 10. Monthly/Annual Revenue Reports with Charts
Interactive charts showing revenue trends: monthly breakdown, cumulative progress, year-over-year comparison.

- **Scope**: Frontend (Recharts / Chart.js), possibly new backend aggregation endpoints
- **Complexity**: Medium
- **Value**: Better business decisions based on data trends

#### 11. Multi-Language Invoice PDF
Support generating invoice PDFs in Serbian (Cyrillic/Latin) and English. Essential for international clients who can't read Serbian invoices.

- **Scope**: Additional Handlebars templates, language selector in invoice form
- **Complexity**: Medium
- **Value**: Professional appearance for foreign clients

#### 12. Payment Tracking & Partial Payments
Track when invoices are actually paid, support partial payments, and record payment method (bank transfer, cash, PayPal, Wise).

- **Scope**: New `Payment` entity linked to invoices
- **Complexity**: Medium
- **Value**: Accurate cash flow tracking

#### 13. Client Revenue Analytics
Per-client reports: total revenue, number of invoices, average invoice value, payment speed. Identify most valuable clients.

- **Scope**: Backend aggregation + frontend analytics page
- **Complexity**: Medium
- **Value**: Strategic insights for business growth

---

### 🟢 Priority: Low (Nice to Have)

#### 14. eFaktura (SEF) Integration
Integration with the Serbian Electronic Invoice system (Sistem E-Faktura). Required for B2G invoices and increasingly for B2B.

- **Scope**: Complex — SEF API integration, XML generation, certificate handling
- **Complexity**: High
- **Value**: Future-proofing as e-invoicing becomes mandatory

#### 15. Accountant Read-Only Access
Generate a read-only link or separate login for your accountant to view invoices, KPO, and limits without editing rights.

- **Scope**: Role-based access control, new `Role` enum
- **Complexity**: Medium
- **Value**: Simplifies accountant collaboration

#### 16. Bank Statement Import & Auto-Matching
Import bank statements (CSV/MT940) and automatically match incoming payments to open invoices.

- **Scope**: File parsing + matching algorithm
- **Complexity**: High
- **Value**: Automates payment reconciliation

#### 17. Contract & Document Storage
Upload and organize contracts, signed agreements, and other business documents per client.

- **Scope**: File upload (S3/MinIO), new `Document` entity
- **Complexity**: Medium
- **Value**: All business documents in one place

#### 18. Tax Calculator
Calculate the monthly fixed tax amount based on municipality and activity code (šifra delatnosti). Show annual tax burden projection.

- **Scope**: Static data table of tax rates by municipality + calculator UI
- **Complexity**: Low-Medium
- **Value**: Helps understand total tax costs

#### 19. Dark Mode Toggle
Add a theme switcher (light/dark/system) to settings.

- **Scope**: Frontend only (Tailwind `dark:` classes, localStorage)
- **Complexity**: Low
- **Value**: Quality-of-life improvement, common expectation in modern apps

#### 20. PWA / Mobile Support
Make the app installable as a PWA with offline invoice viewing and responsive mobile-first layout.

- **Scope**: Service worker, manifest, responsive audit
- **Complexity**: Medium
- **Value**: Access invoices on the go, works offline

#### 21. Invoice Duplication
One-click duplicate an existing invoice (copying client, items, bank account) as a new DRAFT with updated dates.

- **Scope**: Backend endpoint + frontend button
- **Complexity**: Low
- **Value**: Speeds up repetitive invoicing

#### 22. Profit Dashboard (Revenue − Expenses − Taxes)
If expense tracking is implemented — show a real-time view of net profit: revenue minus expenses minus estimated taxes.

- **Scope**: Depends on features #8 and #18
- **Complexity**: Medium
- **Value**: The ultimate "how is my business doing" view

---

## Suggested Implementation Order

| Phase | Features | Theme |
|-------|----------|-------|
| **Phase 1** | #21 Invoice Duplication, #5 Overdue Alerts, #6 Data Export | Quick wins |
| **Phase 2** | #2 NBS Exchange Rates, #1 IPS QR Code | Invoice enhancements |
| **Phase 3** | #4 Email Sending, #3 Recurring Invoices | Automation |
| **Phase 4** | #9 Limit Warnings, #7 Tax Calendar | Compliance |
| **Phase 5** | #10 Revenue Reports, #13 Client Analytics | Analytics |
| **Phase 6** | #8 Expenses, #12 Payment Tracking, #22 Profit Dashboard | Full financial picture |
| **Phase 7** | #11 Multi-lang PDF, #19 Dark Mode, #15 Accountant Access | Polish |
| **Phase 8** | #14 eFaktura, #16 Bank Import, #17 Documents, #20 PWA | Advanced |
