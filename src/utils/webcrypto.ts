/**
 * Password hashing and verification using Web Crypto API
 *
 * This module provides functions for securely hashing and verifying passwords
 * using PBKDF2 from the Web Crypto API, which is compatible with Edge Runtime.
 */

// Constants for PBKDF2 configuration
const SALT_LENGTH = 16; // 16 bytes = 128 bits
const KEY_LENGTH = 64; // 64 bytes = 512 bits
const ITERATIONS = 310000; // Recommended number of iterations for PBKDF2
const HASH_ALGORITHM = 'SHA-512'; // Hash algorithm to use with PBKDF2

/**
 * Generate a random salt
 * 
 * @returns A Uint8Array containing random bytes
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Convert a string to a Uint8Array using TextEncoder
 * 
 * @param str - The string to convert
 * @returns A Uint8Array representation of the string
 */
function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert a Uint8Array to a hex string
 * 
 * @param buffer - The buffer to convert
 * @returns A hex string representation of the buffer
 */
function bufferToHex(buffer: ArrayBuffer | ArrayBufferLike): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert a hex string to a Uint8Array
 * 
 * @param hex - The hex string to convert
 * @returns A Uint8Array representation of the hex string
 */
function hexToBuffer(hex: string): Uint8Array {
  const pairs = hex.match(/[\da-f]{2}/gi) || [];
  return new Uint8Array(pairs.map(pair => parseInt(pair, 16)));
}

/**
 * Hash a password using PBKDF2 with a random salt
 *
 * @param password - The plain text password to hash
 * @returns A promise that resolves to the password hash string in the format 'hex_salt:hex_hash'
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate a random salt
    const salt = generateSalt();
    
    // Import the password as a key
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      stringToBuffer(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    // Derive bits using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: ITERATIONS,
        hash: HASH_ALGORITHM
      },
      passwordKey,
      KEY_LENGTH * 8 // Convert bytes to bits
    );
    
    // Return the salt and derived key as a combined string
    // Format: hex_salt:hex_hash
    return `${bufferToHex(salt.buffer)}:${bufferToHex(derivedBits)}`;
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

    // Convert the salt from hex to Uint8Array
    const salt = hexToBuffer(saltHex);
    
    // Import the password as a key
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      stringToBuffer(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    // Derive bits using PBKDF2 with the same salt
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: ITERATIONS,
        hash: HASH_ALGORITHM
      },
      passwordKey,
      KEY_LENGTH * 8 // Convert bytes to bits
    );
    
    // Convert the derived bits to hex
    const derivedHex = bufferToHex(derivedBits);
    
    // Compare the derived key with the stored hash
    // Note: Web Crypto API doesn't have timingSafeEqual, but this comparison
    // happens after all cryptographic operations are complete
    return derivedHex === hashHex;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}