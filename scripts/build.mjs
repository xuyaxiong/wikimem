#!/usr/bin/env node
import { chmodSync, rmSync, cpSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Step 1: tsc compile
execSync('npx tsc', { stdio: 'inherit' });

// Step 2: chmod +x dist/index.js
try {
  chmodSync('dist/index.js', 0o755);
} catch {
  // Windows: no-op
}

// Step 3: Copy web public assets
rmSync('dist/web/public', { recursive: true, force: true });
cpSync('src/web/public', 'dist/web/public', { recursive: true, force: true });

// Step 4: Copy known-servers.json
const src = 'src/core/mcp-client/known-servers.json';
const dest = 'dist/core/mcp-client/known-servers.json';
if (existsSync(src)) {
  cpSync(src, dest, { force: true });
}
