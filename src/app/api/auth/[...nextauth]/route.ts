import { handlers } from "@/auth";

// Configure the API route to use Node.js runtime instead of Edge runtime
// This ensures WebAssembly modules can be loaded dynamically
export const runtime = 'nodejs';

// Export the NextAuth.js API handlers
export const { GET, POST } = handlers;

// Log that the NextAuth.js API route is being initialized
console.log('[NextAuth] API route initialized with Node.js runtime');
