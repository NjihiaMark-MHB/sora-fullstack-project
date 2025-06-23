// Configuration for the auth API route
export const config = {
  // Allow dynamic code evaluation for the argon2-wasm-edge module
  unstable_allowDynamic: [
    '**/node_modules/argon2-wasm-edge/**',
  ],
};