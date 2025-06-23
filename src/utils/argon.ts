/**
 * Password hashing and verification using Node.js crypto.scrypt
 *
 * This module provides functions for securely hashing and verifying passwords
 * using the scrypt key derivation function from Node.js crypto module.
 */

import { randomBytes, scrypt, timingSafeEqual } from "crypto";

// Constants for scrypt configuration
const SALT_LENGTH = 16; // 16 bytes = 128 bits
const KEY_LENGTH = 64; // 64 bytes = 512 bits

// scrypt parameters - these will be used in a custom wrapper function
const SCRYPT_OPTIONS = {
  N: 16384, // CPU/memory cost parameter
  r: 8, // Block size parameter
  p: 1, // Parallelization parameter
};

// Create a custom promisified version of scrypt that includes our options
const scryptAsync = (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keylen, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
};

/**
 * Hash a password using scrypt with a random salt
 *
 * @param password - The plain text password to hash
 * @returns A promise that resolves to the password hash string in the format 'hex_salt:hex_hash'
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate a random salt
    const salt = randomBytes(SALT_LENGTH);

    // Hash the password with the salt
    const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);

    // Return the salt and derived key as a combined string
    // Format: hex_salt:hex_hash
    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Password hashing failed");
  }
}

/**
 * Verify a password against a stored hash
 *
 * @param password - The plain text password to verify
 * @param storedHash - The stored password hash in the format 'hex_salt:hex_hash'
 * @returns A promise that resolves to true if the password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Split the stored hash into salt and hash components
    const [saltHex, hashHex] = storedHash.split(":");

    if (!saltHex || !hashHex) {
      console.error("Invalid stored hash format");
      return false;
    }

    // Convert the salt from hex to Buffer
    const salt = Buffer.from(saltHex, "hex");

    // Hash the input password with the same salt
    const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);

    // Convert the stored hash from hex to Buffer
    const storedDerivedKey = Buffer.from(hashHex, "hex");

    // Compare the derived key with the stored hash using constant-time comparison
    return timingSafeEqual(derivedKey, storedDerivedKey);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}
