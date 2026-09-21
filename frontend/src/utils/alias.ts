import { copy } from "../copy/es";
import { ALIAS_MAX, ALIAS_MIN, ALIAS_PATTERN } from "../game/constants";

export function validateAlias(raw: string): { ok: true; value: string } | { ok: false; message: string } {
  const value = raw.trim();
  if (!value) {
    return { ok: false, message: copy.alias.required };
  }
  if (value.length < ALIAS_MIN) {
    return { ok: false, message: copy.alias.tooShort };
  }
  if (value.length > ALIAS_MAX) {
    return { ok: false, message: copy.alias.tooLong };
  }
  if (!ALIAS_PATTERN.test(value)) {
    return { ok: false, message: copy.alias.invalidChars };
  }
  return { ok: true, value };
}
