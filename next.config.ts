import type { NextConfig } from "next";
import type { Compiler } from "webpack";
import fs from 'fs';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  // Enable WebAssembly support for webpack
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };
    
    // Copy WebAssembly files to the public directory
    config.plugins = [
      ...config.plugins || [],
      {
        apply: (compiler: Compiler) => {
          compiler.hooks.afterEmit.tap('CopyWasmFiles', () => {
            // Using imported fs and path modules
            
            // Create directories if they don't exist
            const publicWasmDir = path.join(__dirname, 'public', 'wasm');
            fs.mkdirSync(publicWasmDir, { recursive: true });
            
            // Also create the node_modules path for compatibility
            const nodeModulesWasmDir = path.join(__dirname, 'public', 'node_modules', 'argon2-wasm-edge', 'wasm');
            fs.mkdirSync(nodeModulesWasmDir, { recursive: true });
            
            // Source paths
            const argon2WasmPath = require.resolve('argon2-wasm-edge/wasm/argon2.wasm');
            const blake2bWasmPath = require.resolve('argon2-wasm-edge/wasm/blake2b.wasm');
            
            // Copy files to both locations for redundancy
            fs.copyFileSync(argon2WasmPath, path.join(publicWasmDir, 'argon2.wasm'));
            fs.copyFileSync(blake2bWasmPath, path.join(publicWasmDir, 'blake2b.wasm'));
            fs.copyFileSync(argon2WasmPath, path.join(nodeModulesWasmDir, 'argon2.wasm'));
            fs.copyFileSync(blake2bWasmPath, path.join(nodeModulesWasmDir, 'blake2b.wasm'));
          });
        }
      }
    ];
    
    return config;
  },
  // Images configuration
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
