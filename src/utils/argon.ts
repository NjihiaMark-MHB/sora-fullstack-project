import { argon2id, argon2Verify, setWASMModules } from "argon2-wasm-edge";
// Import WASM modules dynamically to avoid build errors
let argon2WASM: WebAssembly.Module;
let blake2bWASM: WebAssembly.Module;
import params from "./argonParams";

/**
 * Tracks initialization state of the WASM modules
 */
let ready = false;

/**
 * Gets the base URL for fetching WASM files
 * Works in both browser and server environments
 */
function getBaseUrl(): string {
  // Check if window is defined (client-side)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // Server-side - use Vercel's environment variables if available
  // Vercel provides VERCEL_URL for all deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For custom domains on production, use PROJECT_PRODUCTION_URL if available
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  
  // Fallback to custom environment variable or localhost
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

/**
 * Initializes the WASM modules for Argon2 password hashing
 * This is called automatically before any password operation
 */
async function init(): Promise<void> {
  if (!ready) {
    try {
      const baseUrl = getBaseUrl();
      
      // Dynamically import WASM modules at runtime
      if (!argon2WASM) {
        argon2WASM = await WebAssembly.compile(
          await (await fetch(`${baseUrl}/wasm/argon2.wasm`)).arrayBuffer()
        ).catch(async (error) => {
          console.error("Failed to load argon2.wasm from /wasm:", error);
          // Try alternative path as fallback
          return WebAssembly.compile(
            await (await fetch(`${baseUrl}/node_modules/argon2-wasm-edge/wasm/argon2.wasm`)).arrayBuffer()
          );
        });
      }
      
      if (!blake2bWASM) {
        blake2bWASM = await WebAssembly.compile(
          await (await fetch(`${baseUrl}/wasm/blake2b.wasm`)).arrayBuffer()
        ).catch(async (error) => {
          console.error("Failed to load blake2b.wasm from /wasm:", error);
          // Try alternative path as fallback
          return WebAssembly.compile(
            await (await fetch(`${baseUrl}/node_modules/argon2-wasm-edge/wasm/blake2b.wasm`)).arrayBuffer()
          );
        });
      }
      
      // Set the WASM modules
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
  await init();
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
  await init();
  return argon2Verify({ password, hash: encoded });
}
