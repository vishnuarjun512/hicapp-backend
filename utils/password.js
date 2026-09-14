import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${Buffer.from(derivedKey).toString("hex")}`;
};

export const verifyPassword = async (password, storedValue) => {
  const [algorithm, salt, expectedHex] = storedValue.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;

  const actual = Buffer.from(await scrypt(password, salt, KEY_LENGTH));
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
