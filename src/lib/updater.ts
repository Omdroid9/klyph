import { useCallback, useEffect, useRef, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdateStatus =
  | { state: "idle" }
  | { state: "downloading"; version: string }
  | { state: "ready"; version: string };

const RECHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h — quiet, not chatty
const FIRST_CHECK_DELAY_MS = 15_000; // let startup finish first

/**
 * Silent background auto-update: check GitHub Releases, download when a new
 * signed build exists, and surface a single "restart" affordance once it is
 * staged. Never interrupts capture. No-ops in dev (no updater artifacts).
 */
export function useAutoUpdater(): {
  update: UpdateStatus;
  restartToUpdate: () => void;
} {
  const [update, setUpdate] = useState<UpdateStatus>({ state: "idle" });
  const busyRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }

    let disposed = false;

    async function checkOnce() {
      if (busyRef.current || disposed) {
        return;
      }
      busyRef.current = true;
      try {
        const found = await check();
        if (!found || disposed) {
          return;
        }
        setUpdate({ state: "downloading", version: found.version });
        await found.downloadAndInstall();
        if (!disposed) {
          setUpdate({ state: "ready", version: found.version });
        }
      } catch {
        // Offline, rate-limited, or no release yet — stay silent and retry
        // on the next interval. Updates must never produce error UI.
      } finally {
        busyRef.current = false;
      }
    }

    const first = window.setTimeout(() => void checkOnce(), FIRST_CHECK_DELAY_MS);
    const interval = window.setInterval(() => void checkOnce(), RECHECK_INTERVAL_MS);

    return () => {
      disposed = true;
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, []);

  const restartToUpdate = useCallback(() => {
    void relaunch();
  }, []);

  return { update, restartToUpdate };
}
