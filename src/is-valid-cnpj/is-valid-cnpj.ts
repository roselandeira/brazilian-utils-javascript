import { sanitizeToDigits } from "../_internals/sanitize-to-digits/sanitize-to-digits";
import { LENGTH, RESERVED_NUMBERS } from "./constants";

const RESERVED_SET = new Set(RESERVED_NUMBERS);

const WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const FORMAT_REGEX =
	/^[0-9A-Z]{2}\.?[0-9A-Z]{3}\.?[0-9A-Z]{3}\/?[0-9A-Z]{4}-?[0-9]{2}$/i;

const NUMERIC_FORMAT_REGEX = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;

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

const isValidChecksum = (cnpj: string): boolean => {
	// First digit (index 12)
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		sum += (cnpj.charCodeAt(i) - 48) * WEIGHTS_1[i];
	}
	let mod = sum % 11;
	const expected1 = mod < 2 ? 48 : 48 + 11 - mod;
	if (cnpj.charCodeAt(12) !== expected1) return false;

	// Second digit (index 13)
	sum = 0;
	for (let i = 0; i < 13; i++) {
		sum += (cnpj.charCodeAt(i) - 48) * WEIGHTS_2[i];
	}
	mod = sum % 11;
	const expected2 = mod < 2 ? 48 : 48 + 11 - mod;
	return cnpj.charCodeAt(13) === expected2;
};

/**
 * Validates if a CNPJ (Cadastro Nacional da Pessoa Jurídica) is valid.
 * Supports both numeric and alphanumeric CNPJ formats (IN RFB 2.229/2024).
 *
 * @param {string} cnpj - The CNPJ value to be validated.
 * @returns {boolean} True if the CNPJ is valid, false otherwise.
 *
 * @example
 * ```typescript
 * // Numeric
 * isValidCnpj("12.345.678/0001-95"); // true
 * isValidCnpj("12345678000195"); // true
 * isValidCnpj("00000000000000"); // false (reserved number)
 *
 * // Alphanumeric (IN RFB 2.229/2024)
 * isValidCnpj("12.ABC.345/01DE-35"); // true
 * isValidCnpj("12ABC34501DE35"); // true
 * isValidCnpj("12.abc.345/01de-35"); // true (lowercase accepted)
 * ```
 */
export const isValidCnpj = (cnpj: string): boolean => {
	if (!cnpj || typeof cnpj !== "string") return false;

	const cleaned = cleanCnpj(cnpj);

	if (cleaned.length !== LENGTH) return false;

	let isNumeric = true;
	let hasLetter = false;

	for (let i = 0; i < LENGTH; i++) {
		const code = cleaned.charCodeAt(i);
		if (code < 48 || code > 57) {
			isNumeric = false;
			if (code >= 65 && code <= 90) hasLetter = true;
		}
	}

	if (isNumeric) {
		const numeric = sanitizeToDigits(cnpj);

		return (
			NUMERIC_FORMAT_REGEX.test(cnpj) &&
			!RESERVED_SET.has(numeric) &&
			isValidChecksum(numeric)
		);
	}

	return hasLetter && FORMAT_REGEX.test(cnpj) && isValidChecksum(cleaned);
};
