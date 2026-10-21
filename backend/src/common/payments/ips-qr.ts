/**
 * NBS IPS QR code ("PR" = payment slip) that Serbian mobile banking apps scan to pre-fill a payment.
 * Tags: K kind, V version, C charset (1 = UTF-8), R recipient account, N recipient, I currency+amount,
 * P payer, SF payment code, S purpose, RO model + reference. Only RSD payments are supported by IPS.
 */
export interface IpsPaymentOrder {
  recipientAccount: string;
  recipientName: string;
  /** In RSD */
  amount: number;
  payerName?: string | null;
  /** Šifra plaćanja, e.g. 221 for goods and services, 253 for public revenue */
  paymentCode: string;
  purpose?: string | null;
  /** Model of the reference ("97", "00"); omit both for no reference */
  model?: string | null;
  reference?: string | null;
}

export class IpsQrError extends Error {}

const LIMITS = { name: 70, purpose: 35, reference: 25 } as const;

/**
 * "160-123456-78" or "160000000012345678" → 18 digits (bank code, 13-digit account, 2 check digits),
 * or null when it is not a valid Serbian account number (ISO 7064 MOD 97-10 check digits).
 */
export const normalizeAccountNumber = (account: string): string | null => {
  const trimmed = account.replace(/\s/g, '');
  let digits: string;
  if (/^\d{3}-\d{1,13}-\d{2}$/.test(trimmed)) {
    const [bank, number, check] = trimmed.split('-');
    digits = bank + number.padStart(13, '0') + check;
  } else if (/^\d{18}$/.test(trimmed)) {
    digits = trimmed;
  } else {
    return null;
  }
  const expected = 98 - Number((BigInt(digits.slice(0, 16)) * 100n) % 97n);
  return expected === Number(digits.slice(16)) ? digits : null;
};

/** "RSD1234,50": comma decimal separator, no thousands grouping */
const formatAmount = (amount: number): string =>
  `RSD${amount.toFixed(2).replace('.', ',')}`;

/** IPS forbids the field separator inside values; also keep each value on one line */
const clean = (value: string, maxLength: number): string =>
  value
    .replace(/[|\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLength);

export const buildIpsQr = (order: IpsPaymentOrder): string => {
  const account = normalizeAccountNumber(order.recipientAccount);
  if (!account) {
    throw new IpsQrError(
      `Invalid recipient account: ${order.recipientAccount}`,
    );
  }
  if (!(order.amount > 0) || order.amount >= 1e15) {
    throw new IpsQrError(`Invalid amount: ${order.amount}`);
  }
  if (!/^[12]\d{2}$/.test(order.paymentCode)) {
    throw new IpsQrError(`Invalid payment code: ${order.paymentCode}`);
  }

  const fields: [string, string][] = [
    ['K', 'PR'],
    ['V', '01'],
    ['C', '1'],
    ['R', account],
    ['N', clean(order.recipientName, LIMITS.name)],
    ['I', formatAmount(order.amount)],
  ];
  if (order.payerName) fields.push(['P', clean(order.payerName, LIMITS.name)]);
  fields.push(['SF', order.paymentCode]);
  if (order.purpose) fields.push(['S', clean(order.purpose, LIMITS.purpose)]);

  const reference = order.reference?.replace(/\s/g, '');
  if (reference) {
    const model = order.model?.trim() || '00';
    if (!/^\d{2}$/.test(model)) throw new IpsQrError(`Invalid model: ${model}`);
    // Model 97 references are digits only; model 00 also allows dashes
    const allowed = model === '97' ? /^\d+$/ : /^[\d-]+$/;
    if (!allowed.test(reference)) {
      throw new IpsQrError(
        `Invalid reference for model ${model}: ${reference}`,
      );
    }
    fields.push(['RO', model + reference.slice(0, LIMITS.reference - 2)]);
  }

  return fields.map(([tag, value]) => `${tag}:${value}`).join('|');
};

/** Same as buildIpsQr, but null instead of an error when the data cannot make a valid code */
export const tryBuildIpsQr = (order: IpsPaymentOrder): string | null => {
  try {
    return buildIpsQr(order);
  } catch {
    return null;
  }
};
