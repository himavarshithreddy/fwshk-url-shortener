const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Encode a positive integer to a Base62 string.
 * Used to convert the Redis monotonic counter into a short code.
 * Example: 983745 -> "4fG2"
 * @param {number} num
 * @returns {string}
 */
export function encode(num) {
  if (num === 0) return ALPHABET[0];
  let str = '';
  while (num > 0) {
    str = ALPHABET[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str;
}
