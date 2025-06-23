/**
 * Configuration parameters for Argon2id password hashing
 * 
 * These parameters balance security and performance for Edge runtime environments.
 * Adjust with caution as they directly impact security and performance.
 */
const argonParams = {
  /** Number of threads to use (limited in Edge environments) */
  parallelism: 1,
  
  /** Number of iterations (higher = more secure, but slower) - current setting ~80ms in Edge */
  iterations: 256,
  
  /** Memory usage in KiB (higher = more secure against hardware attacks) */
  memorySize: 512,
  
  /** Output hash length in bytes */
  hashLength: 32,
  
  /** Output format - "encoded" includes parameters for verification */
  outputType: "encoded",
} as const;

export default argonParams;
