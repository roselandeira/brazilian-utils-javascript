import { isLastChar, onlyNumbers, generateChecksum, generateRandomNumber } from '../../helpers';

function sanitizeCnpj(input: string): string {
  return input.replace(/[.\-/]/g, '').toUpperCase();
}

function charValue(ch: string): number {
  return ch.charCodeAt(0) - 48;
}

export const LENGTH = 14;

export const DOT_INDEXES = [1, 4];

export const SLASH_INDEXES = [7];

export const HYPHEN_INDEXES = [11];

export const RESERVED_NUMBERS = [
  '00000000000000',
  '11111111111111',
  '22222222222222',
  '33333333333333',
  '44444444444444',
  '55555555555555',
  '66666666666666',
  '77777777777777',
  '88888888888888',
  '99999999999999',
];

export const CHECK_DIGITS_INDEXES = [12, 13];

export const FIRST_CHECK_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export const SECOND_CHECK_DIGIT_WEIGHTS = [6, ...FIRST_CHECK_DIGIT_WEIGHTS];

export interface FormatCnpjOptions {
  pad?: boolean;
}

export function format(cnpj: string | number, options: FormatCnpjOptions = {}): string {
  let digits = onlyNumbers(cnpj);

  if (options.pad) {
    digits = digits.padStart(LENGTH, '0');
  }

  return digits
    .slice(0, LENGTH)
    .split('')
    .reduce((acc, digit, index) => {
      const result = `${acc}${digit}`;

      if (!isLastChar(index, digits)) {
        if (DOT_INDEXES.includes(index)) return `${result}.`;
        if (SLASH_INDEXES.includes(index)) return `${result}/`;
        if (HYPHEN_INDEXES.includes(index)) return `${result}-`;
      }

      return result;
    }, '');
}

export function generate(): string {
  const baseCNPJ = generateRandomNumber(LENGTH - 2);

  const firstCheckDigitMod = generateChecksum(baseCNPJ, FIRST_CHECK_DIGIT_WEIGHTS) % 11;
  const firstCheckDigit = (firstCheckDigitMod < 2 ? 0 : 11 - firstCheckDigitMod).toString();

  const secondCheckDigitMod = generateChecksum(baseCNPJ + firstCheckDigit, SECOND_CHECK_DIGIT_WEIGHTS) % 11;
  const secondCheckDigit = (secondCheckDigitMod < 2 ? 0 : 11 - secondCheckDigitMod).toString();

  return `${baseCNPJ}${firstCheckDigit}${secondCheckDigit}`;
}

export function isValidFormat(cnpj: string): boolean {
  return /^[A-Z0-9]{2}\.?[A-Z0-9]{3}\.?[A-Z0-9]{3}\/?[A-Z0-9]{4}-?\d{2}$/i.test(cnpj);
}

export function isReservedNumber(cpf: string): boolean {
  return RESERVED_NUMBERS.indexOf(cpf) >= 0;
}

// TODO: move to checksum helper
export function isValidChecksum(cnpj: string): boolean {
  const weights = [...FIRST_CHECK_DIGIT_WEIGHTS];

  return CHECK_DIGITS_INDEXES.every((i) => {
    if (i === CHECK_DIGITS_INDEXES[CHECK_DIGITS_INDEXES.length - 1]) {
      weights.unshift(6);
    }

    const slice = cnpj.slice(0, i);
    const sum = slice.split('').reduce((acc, ch, idx) => acc + charValue(ch) * weights[idx], 0);
    const mod = sum % 11;

    return cnpj[i] === String(mod < 2 ? 0 : 11 - mod);
  });
}

export function isValid(cnpj: string): boolean {
  if (!cnpj || typeof cnpj !== 'string') return false;

  const sanitized = sanitizeCnpj(cnpj);

  return isValidFormat(cnpj) && !isReservedNumber(sanitized) && isValidChecksum(sanitized);
}
