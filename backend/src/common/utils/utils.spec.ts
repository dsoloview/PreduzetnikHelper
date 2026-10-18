import { escapeHtml } from './html.utils';
import {formatBelgradeDate, formatSerbianDate, getBelgradeYear, getBelgradeYearRange, stripTime} from './date.utils';
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

describe('getBelgradeYear', () => {
  it('uses Belgrade timezone, not UTC', () => {
    expect(getBelgradeYear(new Date('2026-12-31T23:30:00Z'))).toBe(2027);
    expect(getBelgradeYear(new Date('2026-12-31T22:30:00Z'))).toBe(2026);
  });
});

describe('getBelgradeYearRange', () => {
  it('covers exactly the Belgrade calendar year', () => {
    const { start, end } = getBelgradeYearRange(2026);
    expect(start).toEqual(new Date('2025-12-31T23:00:00Z'));
    expect(end).toEqual(new Date('2026-12-31T23:00:00Z'));
    expect(getBelgradeYear(start)).toBe(2026);
    expect(getBelgradeYear(new Date(end.getTime() - 1))).toBe(2026);
    expect(getBelgradeYear(end)).toBe(2027);
  });
});

describe('formatBelgradeDate', () => {
  it('prints the Belgrade calendar date regardless of server timezone', () => {
    // Local midnight in Belgrade sent as UTC by the old frontend
    expect(formatBelgradeDate('2026-09-30T22:00:00.000Z')).toEqual(formatBelgradeDate('2026-10-01T12:00:00Z'));
    // Date-only value stored as UTC midnight
    expect(formatBelgradeDate(new Date('2026-10-01'))).toEqual(formatBelgradeDate('2026-10-01T12:00:00Z'));
    expect(formatBelgradeDate('2026-10-01T12:00:00Z')).toMatch(/^1\. ?10\. ?2026\.?$/);
  });
});
