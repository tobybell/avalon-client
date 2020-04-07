
/**
 * Alphabet for Base-64 encoding, [RFC 4648 §5]
 * (https://tools.ietf.org/html/rfc4648#section-5).
 */
const A64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Generate a new random ID.
 *
 * An ID is a base-64 ASCII string. An 8-character ID contains 48 bits of
 * information.
 *
 * @param length Number of characters in the ID, default 8
 *
 * @returns Randomly generated ID
 */
export function make(length: number = 8): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * 64);
    result += A64[idx];
  }
  return result;
}
