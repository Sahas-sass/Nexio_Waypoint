import { base64ToBytes } from './base64';

const text = (bytes: Uint8Array) => String.fromCharCode(...bytes);

describe('base64ToBytes', () => {
  it.each([
    ['', ''],
    ['TQ==', 'M'],
    ['TWE=', 'Ma'],
    ['TWFu', 'Man'],
    ['aGVsbG8gd29ybGQ=', 'hello world'],
  ])('%s', (input, expected) => {
    expect(text(base64ToBytes(input))).toBe(expected);
  });

  it('ignores whitespace', () => {
    expect(text(base64ToBytes('aGVs\nbG8='))).toBe('hello');
  });
});
