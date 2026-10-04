import {
  formatClock,
  formatDateParts,
  formatKg,
  formatTimestamp,
  formatWindow,
  initials,
  padStop,
  parseDateOnly,
} from './formatters';

describe('formatClock', () => {
  it.each([
    ['08:30:00', '8:30 AM'],
    ['00:05', '12:05 AM'],
    ['12:00:00', '12:00 PM'],
    ['17:45:00', '5:45 PM'],
  ])('%s → %s', (input, expected) => {
    expect(formatClock(input)).toBe(expected);
  });

  it('rejects empty and malformed values', () => {
    expect(formatClock(null)).toBeNull();
    expect(formatClock('')).toBeNull();
    expect(formatClock('soon')).toBeNull();
    expect(formatClock('25:00')).toBeNull();
  });
});

describe('formatWindow', () => {
  it('formats start and end', () => {
    expect(formatWindow('08:00:00', '08:30:00')).toBe('8:00 AM – 8:30 AM');
  });
  it('handles only one bound', () => {
    expect(formatWindow(null, '08:00:00')).toBe('Before 8:00 AM');
    expect(formatWindow('09:00:00', null)).toBe('From 9:00 AM');
  });
  it('falls back to free text then null', () => {
    expect(formatWindow(null, null, ' 10:30 - 11:15 AM ')).toBe('10:30 - 11:15 AM');
    expect(formatWindow(null, null, null)).toBeNull();
  });
});

describe('formatTimestamp', () => {
  it('formats local time', () => {
    const d = new Date(2026, 9, 4, 14, 7);
    expect(formatTimestamp(d.toISOString())).toBe('2:07 PM');
  });
  it('returns null for invalid input', () => {
    expect(formatTimestamp(null)).toBeNull();
    expect(formatTimestamp('nope')).toBeNull();
  });
});

describe('date helpers', () => {
  it('formatDateParts', () => {
    expect(formatDateParts(new Date(2026, 9, 4))).toEqual({
      fullDate: 'Sunday, 4 October',
      dayNumber: '4',
      shortMonth: 'OCT',
    });
  });
  it('parseDateOnly', () => {
    expect(parseDateOnly('2026-10-04')?.getDate()).toBe(4);
    expect(parseDateOnly('bad')).toBeNull();
    expect(parseDateOnly(null)).toBeNull();
  });
});

describe('small formatters', () => {
  it('formatKg', () => expect(formatKg(1620.4)).toBe('1,620 kg'));
  it('padStop', () => expect(padStop(2)).toBe('02'));
  it('initials', () => {
    expect(initials('Kasun Perera')).toBe('KP');
    expect(initials('  anne ')).toBe('A');
    expect(initials(null)).toBe('');
  });
});
