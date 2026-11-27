import * as Crypto from 'expo-crypto';

/**
 * expo-crypto has no PBKDF2 or bcrypt, so passwords are hashed with a random per-account salt
 * and many rounds of SHA-256. The round count is stored with each account so it can be raised later.
 */
export const HASH_ROUNDS = 1000;

export function makeSalt() {
  return Array.from(Crypto.getRandomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string, rounds = HASH_ROUNDS) {
  let h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
  for (let i = 1; i < rounds; i++) {
    h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${h}:${salt}`);
  }
  return h;
}
