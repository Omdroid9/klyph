import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (process.platform === "win32") {
  spawnSync("taskkill", ["/F", "/IM", "klyph.exe"], { stdio: "ignore" });
}

const reset = spawnSync("python", [path.join(root, "scripts", "reset-onboarding.py")], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (reset.status !== 0) {
  process.exit(reset.status ?? 1);
}

const dev = spawnSync("npm", ["run", "tauri", "dev"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
process.exit(dev.status ?? 0);
