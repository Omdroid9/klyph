#!/usr/bin/env node
/**
 * Build a Windows installer for friend/beta testing.
 * Runs lint, tests, frontend build, then Tauri bundle.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function run(label, command, args) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\n✗ ${label} failed`);
    process.exit(result.status ?? 1);
  }
}

function findInstallers(dir, found = []) {
  if (!fs.existsSync(dir)) {
    return found;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findInstallers(full, found);
      continue;
    }
    if (/\.(msi|exe|dmg|appimage|deb)$/i.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

run("Lint", "npm", ["run", "lint"]);
run("Tests", "npm", ["test"]);
run("Frontend build", "npm", ["run", "build"]);
run("Tauri bundle", "npm", ["run", "tauri", "build"]);

const bundleRoot = path.join(root, "src-tauri", "target", "release", "bundle");
const installers = findInstallers(bundleRoot).sort();

console.log("\n✓ Friend release build complete\n");

if (installers.length === 0) {
  console.log("No installer found under:");
  console.log(`  ${bundleRoot}`);
  console.log("\nCheck src-tauri/target/release/ for klyph.exe");
} else {
  console.log("Send your friend one of these installers:\n");
  for (const file of installers) {
    const stat = fs.statSync(file);
    const mb = (stat.size / (1024 * 1024)).toFixed(1);
    console.log(`  ${file}`);
    console.log(`    (${mb} MB)\n`);
  }
}

console.log("Next: read docs/FRIEND_TESTING.md and share it with your tester.");
