import { LENGTH, RESERVED_NUMBERS } from "./constants";

const RESERVED_SET = new Set(RESERVED_NUMBERS);

const BASE_LENGTH = 12;

const WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Matches a CNPJ with or without the `AA.AAA.AAA/AAAA-DV` mask.
 *
 * The first 12 positions accept letters (case-insensitive) and digits, while
 * the 2 check digits (DV) remain strictly numeric.
 */
const FORMAT_REGEX =
	/^[0-9A-Za-z]{2}\.?[0-9A-Za-z]{3}\.?[0-9A-Za-z]{3}\/?[0-9A-Za-z]{4}-?[0-9]{2}$/;

/**
 * Removes the mask characters and normalizes letters to uppercase, keeping only
 * the alphanumeric positions of a CNPJ.
 */
const cleanCnpj = (cnpj: string): string => {
	let result = "";
	for (let i = 0; i < cnpj.length; i++) {
		const char = cnpj[i];
		if (
			(char >= "0" && char <= "9") ||
			(char >= "A" && char <= "Z") ||
			(char >= "a" && char <= "z")
		) {
			result +=
				char >= "a" && char <= "z"
					? String.fromCharCode(char.charCodeAt(0) - 32)
					: char;
		}
	}
	return result;
};

/**
 * Computes the expected DV character for a given partial CNPJ using the
 * modulo 11 algorithm. Each position is converted to a number with
 * `charCodeAt - 48`, so `'0'..'9'` map to `0..9` and `'A'..'Z'` map to `17..42`.
 */
const expectedCheckDigit = (cnpj: string, weights: number[]): number => {
	let sum = 0;
	for (let i = 0; i < weights.length; i++) {
		sum += (cnpj.charCodeAt(i) - 48) * weights[i];
	}
	const mod = sum % 11;
	// The DV is always numeric; 48 is the char code of '0'.
	return mod < 2 ? 48 : 48 + 11 - mod;
};

const isValidChecksum = (cnpj: string): boolean =>
	cnpj.charCodeAt(12) === expectedCheckDigit(cnpj, WEIGHTS_1) &&
	cnpj.charCodeAt(13) === expectedCheckDigit(cnpj, WEIGHTS_2);

/**
 * Validates if a CNPJ (Cadastro Nacional da Pessoa Jurídica) is valid.
 *
 * By default both the legacy numeric format and the new alphanumeric format
 * (Receita Federal IN RFB 2.229/2024 / NT 2025.001, effective July 2026) are
 * accepted. The input may be masked (`AA.AAA.AAA/AAAA-DV`) or unmasked, and
 * letters are treated case-insensitively (normalized to uppercase).
 *
 * The check digits (DV) are computed with the modulo 11 algorithm where each of
 * the first 12 characters is converted to a number using `charCodeAt - 48`
 * (`'0'..'9'` -> `0..9`, `'A'` -> `17`, `'B'` -> `18`, ...). The 2 DV positions
 * are always numeric.
 *
 * @param {string} cnpj - The CNPJ value to be validated.
 * @param {{version?: 1|2}} [options] - Optional options:
 *    version = 1 -> validate numeric-only format (legacy strict mode)
 *    version = 2 -> validate both numeric and alphanumeric formats
 *    (omitted)   -> validate both numeric and alphanumeric formats
 * @returns {boolean} True if the CNPJ is valid, false otherwise.
 *
 * @example
 * ```typescript
 * // Numeric (backward compatible)
 * isValidCnpj("12.345.678/0001-95"); // true
 * isValidCnpj("12345678000195"); // true
 * isValidCnpj("00000000000000"); // false (reserved number)
 * isValidCnpj("12345678000190"); // false (invalid checksum)
 *
 * // Alphanumeric
 * isValidCnpj("12.ABC.345/01DE-35"); // true
 * isValidCnpj("12ABC34501DE35"); // true (unmasked)
 * isValidCnpj("12.abc.345/01de-35"); // true (lowercase)
 *
 * // Restrict to numeric-only
 * isValidCnpj("12.ABC.345/01DE-35", { version: 1 }); // false
 * ```
 */
export const isValidCnpj = (
	cnpj: string,
	options?: { version?: 1 | 2 },
): boolean => {
	if (!cnpj || typeof cnpj !== "string") return false;

	if (!FORMAT_REGEX.test(cnpj)) return false;

	const cleaned = cleanCnpj(cnpj);

	if (cleaned.length !== LENGTH) return false;

	let isNumeric = true;
	for (let i = 0; i < BASE_LENGTH; i++) {
		const code = cleaned.charCodeAt(i);
		if (code < 48 || code > 57) {
			isNumeric = false;
			break;
		}
	}

	// Legacy strict mode: reject anything that is not purely numeric.
	if (options?.version === 1 && !isNumeric) return false;

	// Reserved repeated-digit numbers are only invalid for numeric CNPJs.
	if (isNumeric && RESERVED_SET.has(cleaned)) return false;

	return isValidChecksum(cleaned);
};
