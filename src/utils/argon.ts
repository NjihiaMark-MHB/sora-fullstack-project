import { argon2id, argon2Verify, setWASMModules } from "argon2-wasm-edge";
import argon2WASM from "argon2-wasm-edge/wasm/argon2.wasm?module";
import blake2bWASM from "argon2-wasm-edge/wasm/blake2b.wasm?module";
import params from "./argonParams";

/**
 * Tracks initialization state of the WASM modules
 */
let ready = false;

/**
 * Initializes the WASM modules for Argon2 password hashing
 * This is called automatically before any password operation
 */
function init(): void {
  if (!ready) {
    try {
      // costs only one micro-task, then cached for the life of the edge worker
      setWASMModules({ argon2WASM, blake2bWASM });
      ready = true;
    } catch (error) {
      console.error("Failed to initialize Argon2 WASM modules:", error);
      throw new Error("Password hashing service unavailable");
    }
  }
}

/**
 * Hashes a password using Argon2id
 * 
 * @param password - The plain text password to hash
 * @returns A promise that resolves to the encoded password hash
 */
export async function hashPassword(password: string): Promise<string> {
  init();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return argon2id({ ...params, password, salt });
}

/**
 * Verifies a password against a stored hash
 * 
 * @param password - The plain text password to verify
 * @param encoded - The stored encoded hash to compare against
 * @returns A promise that resolves to true if the password matches, false otherwise
 */
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  init();
  return argon2Verify({ password, hash: encoded });
}
