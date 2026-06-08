import { describe, expect, test } from "vitest";
import { generateCnpj } from "../generate-cnpj/generate-cnpj";
import { LENGTH, RESERVED_NUMBERS } from "./constants";
import { isValidCnpj } from "./is-valid-cnpj";

describe("isValidCnpj", () => {
	describe("should return false", () => {
		test("when it is on the RESERVED_NUMBERS", () => {
			for (const cnpj of RESERVED_NUMBERS) {
				expect(isValidCnpj(cnpj)).toBe(false);
			}
		});

		test("when it is an empty string", () => {
			expect(isValidCnpj("")).toBe(false);
		});

		test("when it is null", () => {
			// biome-ignore lint/suspicious/noExplicitAny: testing invalid inputs
			expect(isValidCnpj(null as any)).toBe(false);
		});

		test("when it is undefined", () => {
			// biome-ignore lint/suspicious/noExplicitAny: testing invalid inputs
			expect(isValidCnpj(undefined as any)).toBe(false);
		});

		test("when it is a boolean", () => {
			// biome-ignore lint/suspicious/noExplicitAny: testing invalid inputs
			expect(isValidCnpj(true as any)).toBe(false);
			// biome-ignore lint/suspicious/noExplicitAny: testing invalid inputs
			expect(isValidCnpj(false as any)).toBe(false);
		});

		test("when it is an object", () => {
			// biome-ignore lint/suspicious/noExplicitAny: testing invalid inputs
			expect(isValidCnpj({} as any)).toBe(false);
		});

		test("when it is an array", () => {
			// biome-ignore lint/suspicious/noExplicitAny: testing invalid inputs
			expect(isValidCnpj([] as any)).toBe(false);
		});

		test(`when dont match with CNPJ length (${LENGTH})`, () => {
			expect(isValidCnpj("12312312312")).toBe(false);
		});

		test("when contains only letters or special characters", () => {
			expect(isValidCnpj("ababcabcabcdab")).toBe(false);
		});

		test("when is a CNPJ invalid test numbers with letters", () => {
			expect(isValidCnpj("6ad0.t391.9asd47/0ad001-00")).toBe(false);
		});

		test("when is a CNPJ invalid", () => {
			expect(isValidCnpj("11257245286531")).toBe(false);
		});

		test("when is an invalid alphanumeric CNPJ", () => {
			expect(isValidCnpj("12.ABC.345/01DE-99")).toBe(false); // Invalid DV
			expect(isValidCnpj("AB.1C2.D3E/4F5G-3")).toBe(false); // Too short
			expect(isValidCnpj("AB.1C2.D3E/4F5G-356")).toBe(false); // Too long
		});

		test("when alphanumeric CNPJ has wrong check digits", () => {
			expect(isValidCnpj("12.ABC.345/01DE-00")).toBe(false);
			expect(isValidCnpj("12.ABC.345/01DE-36")).toBe(false);
			expect(isValidCnpj("12ABC34501DE99")).toBe(false);
		});

		test("when alphanumeric CNPJ has non-allowed characters", () => {
			expect(isValidCnpj("12.AB!.345/01DE-35")).toBe(false);
			expect(isValidCnpj("12.AB@.345/01DE-35")).toBe(false);
			expect(isValidCnpj("12.AB#.345/01DE-35")).toBe(false);
		});

		test("when alphanumeric CNPJ has letters in check digit positions", () => {
			expect(isValidCnpj("12.ABC.345/01DE-AB")).toBe(false);
			expect(isValidCnpj("12ABC34501DEAB")).toBe(false);
		});
	});

	describe("should return true", () => {
		test("when is a CNPJ valid without mask", () => {
			expect(isValidCnpj("13723705000189")).toBe(true);
		});

		test("when is a CNPJ valid with mask", () => {
			expect(isValidCnpj("60.391.947/0001-00")).toBe(true);
		});

		test("when is a valid numeric CNPJ (04.252.011/0001-10)", () => {
			expect(isValidCnpj("04.252.011/0001-10")).toBe(true);
			expect(isValidCnpj("04252011000110")).toBe(true);
		});

		test("when is the official alphanumeric example (12.ABC.345/01DE-35)", () => {
			expect(isValidCnpj("12.ABC.345/01DE-35")).toBe(true);
			expect(isValidCnpj("12ABC34501DE35")).toBe(true);
		});

		test("when alphanumeric CNPJ is provided in lowercase", () => {
			expect(isValidCnpj("12.abc.345/01de-35")).toBe(true);
			expect(isValidCnpj("12abc34501de35")).toBe(true);
		});

		test("when alphanumeric CNPJ is provided in mixed case", () => {
			expect(isValidCnpj("12.Abc.345/01De-35")).toBe(true);
		});

		test("when is a generated alphanumeric CNPJ (Q0.SLF.MBD/7VX4-39)", () => {
			expect(isValidCnpj("Q0.SLF.MBD/7VX4-39")).toBe(true);
			expect(isValidCnpj("Q0SLFMBD7VX439")).toBe(true);
		});

		for (let i = 0; i < 100; i++) {
			const version = ((i % 2) + 1) as 1 | 2;
			const cnpj = generateCnpj(version);
			expect(isValidCnpj(cnpj)).toBe(true);
		}
	});
});
