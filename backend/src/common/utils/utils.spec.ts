import { escapeHtml } from './html.utils';
import { formatSerbianDate, stripTime } from './date.utils';
import { assertOwnership } from './ownership.utils';
import { ForbiddenException } from '@nestjs/common';

describe('escapeHtml', () => {
  it('should escape &, <, >, ", \'', () => {
    expect(escapeHtml('a & b')).toEqual('a &amp; b');
    expect(escapeHtml('<script>')).toEqual('&lt;script&gt;');
    expect(escapeHtml('"quoted"')).toEqual('&quot;quoted&quot;');
    expect(escapeHtml("it's")).toEqual('it&#039;s');
  });

  it('should return unchanged string when no special chars', () => {
    expect(escapeHtml('Hello World')).toEqual('Hello World');
  });
});

describe('formatSerbianDate', () => {
  it('should format date as DD.MM.YYYY', () => {
    expect(formatSerbianDate(new Date(2026, 0, 5))).toEqual('05.01.2026');
    expect(formatSerbianDate(new Date(2026, 11, 31))).toEqual('31.12.2026');
  });
});

describe('stripTime', () => {
  it('should return a UTC date with time set to midnight', () => {
    const result = stripTime(new Date(2026, 4, 15, 14, 30, 0));
    expect(result.getUTCHours()).toEqual(0);
    expect(result.getUTCMinutes()).toEqual(0);
    expect(result.getUTCDate()).toEqual(15);
    expect(result.getUTCMonth()).toEqual(4);
    expect(result.getUTCFullYear()).toEqual(2026);
  });
});

describe('assertOwnership', () => {
  it('should not throw when userId matches', () => {
    expect(() => assertOwnership({ userId: 'user-1' }, 'user-1', 'invoice')).not.toThrow();
  });

  it('should throw ForbiddenException when userId does not match', () => {
    expect(() => assertOwnership({ userId: 'user-2' }, 'user-1', 'invoice')).toThrow(ForbiddenException);
  });
});
