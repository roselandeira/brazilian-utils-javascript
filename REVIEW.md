# Review standards (read by Devin Review)

When reviewing PRs in this repo, enforce these conventions and flag violations:

- **Backward compatibility:** numeric CNPJ validation must behave exactly as before. Flag any change that
  could alter results for existing purely-numeric inputs (masked or unmasked) or for reserved/blacklisted numbers.
- **Public API stability:** `isValid` must remain a named export at `src/utilities/cnpj/index.ts`, callable as
  `isValid(cnpj: string): boolean`. Flag any rename, move, or signature change (e.g. requiring an options
  argument), since downstream consumers call `isValid(value)` with no flags.
- **Default behavior:** alphanumeric support must be ON by default (no version/option flag required).
- **Check-digit math:** the alphanumeric DV uses modulo 11 with each character valued as `(ASCII code) − 48`.
  Flag hard-coded letter maps or off-by-one weight errors.
- **Tests:** every behavior change must be covered by jest tests; flag new branches without tests.
- **Tooling:** do not migrate away from tsdx/jest and do not depend on `tsdx build`.
