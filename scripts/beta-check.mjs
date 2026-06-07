import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const authEnvPath = path.join(root, "auth-server", ".env");

const googleEnvKeys = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

const providerEnvKeys = [
  "SLACK_CLIENT_ID",
  "SLACK_CLIENT_SECRET",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "NOTION_CLIENT_ID",
  "NOTION_CLIENT_SECRET",
  ...googleEnvKeys,
];

function runCommand(command, args) {
  const candidates = [command];
  const userProfile = process.env.USERPROFILE || "";
  if (userProfile) {
    candidates.push(path.join(userProfile, ".cargo", "bin", `${command}.exe`));
  }

  for (const candidate of candidates) {
    const result = spawnSync(candidate, args, {
      encoding: "utf8",
      shell: false,
    });

    if (result.error) {
      const code = /** @type {{ code?: string }} */ (result.error).code;
      if (code === "ENOENT") {
        continue;
      }
      return { ok: false, output: String(result.error.message || result.error) };
    }

    return {
      ok: result.status === 0,
      output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
    };
  }

  return { ok: false, output: `${command} not found` };
}

function parseSimpleEnv(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    if (index < 0) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    values[key] = value;
  }
  return values;
}

function check() {
  const failures = [];
  const warnings = [];
  const passes = [];

  const nodeVersion = process.versions.node;
  passes.push(`Node detected: ${nodeVersion}`);

  const cargo = runCommand("cargo", ["--version"]);
  if (cargo.ok) {
    passes.push(`Cargo detected: ${cargo.output}`);
  } else {
    failures.push("Cargo is missing. Install Rust + Cargo before shipping desktop builds.");
  }

  const rustc = runCommand("rustc", ["--version"]);
  if (rustc.ok) {
    passes.push(`Rustc detected: ${rustc.output}`);
  } else {
    failures.push("Rustc is missing. Install Rust toolchain before shipping desktop builds.");
  }

  if (!fs.existsSync(authEnvPath)) {
    warnings.push("auth-server/.env is missing. OAuth Connect buttons will fail until server env is configured.");
  } else {
    const envValues = parseSimpleEnv(fs.readFileSync(authEnvPath, "utf8"));
    const missing = providerEnvKeys.filter((key) => !envValues[key] || envValues[key].length === 0);
    if (missing.length > 0) {
      warnings.push(
        `auth-server/.env missing provider keys: ${missing.join(", ")}. Connect will fail for those providers.`,
      );
    } else {
      passes.push("auth-server/.env contains all provider client IDs/secrets.");
    }
  }

  console.log("Klyph beta readiness check\n");
  for (const message of passes) {
    console.log(`PASS    ${message}`);
  }
  for (const message of warnings) {
    console.log(`WARN    ${message}`);
  }
  for (const message of failures) {
    console.log(`FAIL    ${message}`);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    console.log("\nCheck completed with warnings.");
    return;
  }

  console.log("\nCheck completed successfully.");
}

check();
