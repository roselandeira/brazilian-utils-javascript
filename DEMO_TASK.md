# DEMO_TASK — Alphanumeric CNPJ (read this before starting)

You are working inside this public TypeScript library `brazilian-utils`
(fork: github.com/roselandeira/brazilian-utils-javascript). This is a live client demo for a
Brazilian bank. The work is split into **two steps**: do **STEP 1 first**, then **STEP 2** only when asked.

## Consumer contract (MUST NOT break)
A separate presentation app (the "casquinha", github.com/roselandeira/btu-cnpj-signup) consumes this
library by importing its TypeScript **source** directly, via tsx:

```ts
import * as cnpjModule from "../brazilian-utils-javascript/src/utilities/cnpj/index.js";
const cnpjLib = (cnpjModule.default ?? cnpjModule);   // the lib is CommonJS (tsdx)
// it then calls:  cnpjLib.isValid(value)
```

Therefore you MUST:
- Keep a **named export `isValid`** at `src/utilities/cnpj/index.ts` (do NOT rename it, do NOT move the file).
- Keep it callable as `isValid(cnpj: string): boolean` with **NO required options**. The casquinha calls
  `isValid(value)` with a single string and no flags, so the **DEFAULT** behavior (no options) MUST accept
  **BOTH numeric and alphanumeric** CNPJs. Do NOT hide alphanumeric support behind a version/option flag.
- Do NOT modify the casquinha repo.

## Environment
- Branch: start from **`demo-base`** (numeric-only baseline). Create a working branch **`devin/cnpj-alphanumeric`**.
- This repo uses **tsdx + jest on Node 16**. Install with `npm install --legacy-peer-deps`, run tests with `npm test`.
- Do NOT migrate tooling and do NOT rely on `tsdx build` (the production bundle is broken on this toolchain).
  **Success = `npm test` green.**

## Files to change (start here)
- `src/utilities/cnpj/index.ts` (+ `index.test.ts`) — entry point (`isValid` / `format` / `generate` / `isValidFormat` / `isValidChecksum`).
- `src/helpers/generate-checksum/` — modulo-11 check digit; the ASCII-48 conversion belongs here.
- `src/helpers/only-numbers/` — input sanitization (digits-only today; generalize so A-Z survive for the
  alphanumeric path, while the numeric path stays identical).

## Spec (deterministic)
- A CNPJ has 14 positions. New format: first 12 positions may be UPPERCASE `A-Z` and digits `0-9`; the last
  2 positions are the check digits (DV) and remain **NUMERIC**.
- DV uses the standard modulo-11 weights, but each character is converted with **(ASCII code) − 48**, so
  `'0'..'9' -> 0..9` and `'A'=17, 'B'=18, ..., 'Z'=42`.
- Accept input with or without the mask `AA.AAA.AAA/AAAA-DV`; normalize letters to uppercase (accept
  lowercase). Reject anything that is not exactly 14 valid positions or has non-allowed characters.
- Existing purely-numeric CNPJs must validate **EXACTLY** as before (including reserved numbers, masked/unmasked).
- Canonical alphanumeric example: **`12.ABC.345/01DE-35`** — its check digits `35` are VERIFIED correct.

---

## STEP 1 — Modernize: implement alphanumeric (do this first)
Implement the alphanumeric support per the spec above, keeping numeric fully backward compatible.
- FIRST post a short **PLAN** and wait for approval; then post one-line status updates per milestone.
- Run `npm install --legacy-peer-deps` then `npm test`; ALL existing tests must still pass.
- Open a **PULL REQUEST targeting `demo-live`** from `devin/cnpj-alphanumeric`, with a clear title and a
  description explaining the rule (ASCII-48 modulo 11), what changed, and backward compatibility.

## STEP 2 — Test coverage (only when asked, after review)
On the **same branch / same PR**, add thorough **jest** unit tests for the CNPJ module
(`isValid` / `format` / `generate`), covering:
- valid numeric, masked vs unmasked, lowercase input;
- valid alphanumeric (include `12.ABC.345/01DE-35`);
- wrong length, non-allowed characters, wrong check digits;
- reserved/blacklisted numbers.
Keep all tests green (`npm test`) and push to the existing PR.
