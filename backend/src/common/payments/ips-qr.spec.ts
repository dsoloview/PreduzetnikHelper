import {
  buildIpsQr,
  IpsQrError,
  normalizeAccountNumber,
  tryBuildIpsQr,
} from './ips-qr';

const TAX_ACCOUNT = '840-711122843-32';

describe('normalizeAccountNumber', () => {
  it('pads the account part to 13 digits', () => {
    expect(normalizeAccountNumber(TAX_ACCOUNT)).toBe('840000071112284332');
    expect(normalizeAccountNumber('840-0000721313843-74')).toBe(
      '840000072131384374',
    );
  });

  it('accepts the 18-digit form', () => {
    expect(normalizeAccountNumber('840000072132584361')).toBe(
      '840000072132584361',
    );
  });

  it('rejects wrong check digits and malformed input', () => {
    expect(normalizeAccountNumber('840-711122843-33')).toBeNull();
    expect(normalizeAccountNumber('RS35160005080003520714')).toBeNull();
    expect(normalizeAccountNumber('')).toBeNull();
  });
});

describe('buildIpsQr', () => {
  const order = {
    recipientAccount: TAX_ACCOUNT,
    recipientName: 'Poreska uprava',
    amount: 12345.6,
    payerName: 'Marko Petrović PR, Novi Sad',
    paymentCode: '253',
    purpose: 'Porez 09/2026',
    model: '97',
    reference: '1234567890',
  };

  it('builds the IPS string in tag order', () => {
    expect(buildIpsQr(order)).toBe(
      'K:PR|V:01|C:1|R:840000071112284332|N:Poreska uprava|I:RSD12345,60|' +
        'P:Marko Petrović PR, Novi Sad|SF:253|S:Porez 09/2026|RO:971234567890',
    );
  });

  it('omits optional fields and keeps values free of separators', () => {
    expect(
      buildIpsQr({
        ...order,
        payerName: null,
        purpose: null,
        reference: null,
        recipientName: 'A|B\nC',
      }),
    ).toBe('K:PR|V:01|C:1|R:840000071112284332|N:A B C|I:RSD12345,60|SF:253');
  });

  it('truncates long values to the IPS limits', () => {
    const qr = buildIpsQr({ ...order, purpose: 'x'.repeat(50) });
    expect(qr).toContain(`S:${'x'.repeat(35)}|`);
  });

  it('allows dashes in model 00 references but not in model 97', () => {
    expect(buildIpsQr({ ...order, model: '00', reference: '12-2026' })).toMatch(
      /RO:0012-2026$/,
    );
    expect(() => buildIpsQr({ ...order, reference: '12-2026' })).toThrow(
      IpsQrError,
    );
  });

  it('rejects invalid accounts, amounts and payment codes', () => {
    expect(() =>
      buildIpsQr({ ...order, recipientAccount: '160-0000000123456-78' }),
    ).toThrow(IpsQrError);
    expect(() => buildIpsQr({ ...order, amount: 0 })).toThrow(IpsQrError);
    expect(() => buildIpsQr({ ...order, paymentCode: '53' })).toThrow(
      IpsQrError,
    );
    expect(tryBuildIpsQr({ ...order, amount: -1 })).toBeNull();
  });
});
