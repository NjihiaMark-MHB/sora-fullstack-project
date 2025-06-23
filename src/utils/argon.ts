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
    console.log('[Argon2] Client-side environment detected, using window.location.origin');
    return window.location.origin;
  }
  
  // Log all available environment variables that might be relevant
  console.log('[Argon2] Server-side environment variables:', {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  
  // Server-side - use Vercel's environment variables if available
  // For production deployments with custom domains
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log(`[Argon2] Using production Vercel URL: ${url}`);
    return url;
  }
  
  // For preview deployments
  if (process.env.VERCEL_URL) {
    // Always use HTTPS for Vercel deployments
    const url = `https://${process.env.VERCEL_URL}`;
    console.log(`[Argon2] Using preview Vercel URL: ${url}`);
    return url;
  }
  
  // For local development or if no Vercel URL is available
  const fallbackUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  console.log(`[Argon2] Using fallback URL: ${fallbackUrl}`);
  return fallbackUrl;
}

/**
 * Initializes the WASM modules for Argon2 password hashing
 * This is called automatically before any password operation
 */
async function init(): Promise<void> {
  if (!ready) {
    try {
      const baseUrl = getBaseUrl();
      console.log(`[Argon2] Using base URL: ${baseUrl}`);
      
      // Dynamically import WASM modules at runtime
      if (!argon2WASM) {
        try {
          console.log(`[Argon2] Attempting to load argon2.wasm from ${baseUrl}/wasm/argon2.wasm`);
          const argon2Response = await fetch(`${baseUrl}/wasm/argon2.wasm`);
          
          if (!argon2Response.ok) {
            throw new Error(`Failed to fetch argon2.wasm: ${argon2Response.status} ${argon2Response.statusText}`);
          }
          
          const argon2Buffer = await argon2Response.arrayBuffer();
          argon2WASM = await WebAssembly.compile(argon2Buffer);
          console.log('[Argon2] Successfully loaded argon2.wasm from primary path');
        } catch (error) {
          console.error("[Argon2] Failed to load argon2.wasm from /wasm:", error);
          console.log('[Argon2] Trying alternative path for argon2.wasm');
          
          // Try alternative path as fallback
          const altPath = `${baseUrl}/node_modules/argon2-wasm-edge/wasm/argon2.wasm`;
          console.log(`[Argon2] Attempting to load from ${altPath}`);
          const altResponse = await fetch(altPath);
          
          if (!altResponse.ok) {
            throw new Error(`Failed to fetch argon2.wasm from alternative path: ${altResponse.status} ${altResponse.statusText}`);
          }
          
          const altBuffer = await altResponse.arrayBuffer();
          argon2WASM = await WebAssembly.compile(altBuffer);
          console.log('[Argon2] Successfully loaded argon2.wasm from alternative path');
        }
      }
      
      if (!blake2bWASM) {
        try {
          console.log(`[Argon2] Attempting to load blake2b.wasm from ${baseUrl}/wasm/blake2b.wasm`);
          const blake2bResponse = await fetch(`${baseUrl}/wasm/blake2b.wasm`);
          
          if (!blake2bResponse.ok) {
            throw new Error(`Failed to fetch blake2b.wasm: ${blake2bResponse.status} ${blake2bResponse.statusText}`);
          }
          
          const blake2bBuffer = await blake2bResponse.arrayBuffer();
          blake2bWASM = await WebAssembly.compile(blake2bBuffer);
          console.log('[Argon2] Successfully loaded blake2b.wasm from primary path');
        } catch (error) {
          console.error("[Argon2] Failed to load blake2b.wasm from /wasm:", error);
          console.log('[Argon2] Trying alternative path for blake2b.wasm');
          
          // Try alternative path as fallback
          const altPath = `${baseUrl}/node_modules/argon2-wasm-edge/wasm/blake2b.wasm`;
          console.log(`[Argon2] Attempting to load from ${altPath}`);
          const altResponse = await fetch(altPath);
          
          if (!altResponse.ok) {
            throw new Error(`Failed to fetch blake2b.wasm from alternative path: ${altResponse.status} ${altResponse.statusText}`);
          }
          
          const altBuffer = await altResponse.arrayBuffer();
          blake2bWASM = await WebAssembly.compile(altBuffer);
          console.log('[Argon2] Successfully loaded blake2b.wasm from alternative path');
        }
      }
      
      // Set the WASM modules
      setWASMModules({ argon2WASM, blake2bWASM });
      ready = true;
      console.log('[Argon2] Successfully initialized WASM modules');
    } catch (error) {
      console.error("[Argon2] Failed to initialize Argon2 WASM modules:", error);
      throw new Error("Password hashing service unavailable");
    }
  }
}

/**
 * Hashes a password using Argon2id
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`[Argon2] Attempting to hash password (attempt ${retryCount + 1}/${maxRetries})`);
      await init();
      
      // Generate a random salt for each hash attempt
      const salt = crypto.getRandomValues(new Uint8Array(16));
      
      const result = await argon2id({
        password,
        salt,
        ...params,
      });
      console.log('[Argon2] Password hashing completed successfully');
      return result;
    } catch (error) {
      console.error(`[Argon2] Error hashing password (attempt ${retryCount + 1}/${maxRetries}):`, error);
      retryCount++;
      
      if (retryCount >= maxRetries) {
        console.error('[Argon2] Maximum retry attempts reached. Password hashing failed.');
        throw new Error("Password hashing failed: Password hashing service unavailable");
      }
      
      // Wait before retrying
      console.log(`[Argon2] Waiting before retry attempt ${retryCount + 1}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
  
  // This should never be reached due to the throw in the catch block
  throw new Error("Password hashing failed: Unexpected error");
}

/**
 * Verifies a password against a hash
 * @param password The plain text password to verify
 * @param hash The hash to verify against
 * @returns True if the password matches the hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`[Argon2] Attempting to verify password (attempt ${retryCount + 1}/${maxRetries})`);
      await init();
      const result = await argon2Verify({
        password,
        hash,
      });
      console.log('[Argon2] Password verification completed successfully');
      return result;
    } catch (error) {
      console.error(`[Argon2] Error verifying password (attempt ${retryCount + 1}/${maxRetries}):`, error);
      retryCount++;
      
      if (retryCount >= maxRetries) {
        console.error('[Argon2] Maximum retry attempts reached. Password verification failed.');
        throw new Error("Password verification failed: Password hashing service unavailable");
      }
      
      // Wait before retrying
      console.log(`[Argon2] Waiting before retry attempt ${retryCount + 1}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
  
  // This should never be reached due to the throw in the catch block
  throw new Error("Password verification failed: Unexpected error");
}
