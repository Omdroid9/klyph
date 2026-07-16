import { useCallback, useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { listCaptures } from "../lib/db";
import type { Capture } from "../types";

const isTauriRuntime =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Captures live in SQLite and any window can mutate them. We refresh whenever
 * something fires `chute://request-sync` (already broadcast on save,
 * edit, delete, retry) so the Library stays current without polling.
 */
export function useCaptures(limit = 250) {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const inflight = useRef(0);

  const refresh = useCallback(async () => {
    const token = ++inflight.current;
    setLoading(true);
    try {
      const nextCaptures = await listCaptures(limit);
      if (token === inflight.current) {
        setCaptures(nextCaptures);
      }
    } finally {
      if (token === inflight.current) {
        setLoading(false);
      }
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isTauriRuntime) {
      return;
    }
    const unsubscribers: Array<() => void> = [];
    const subscribe = async () => {
      for (const event of [
        "chute://request-sync",
        "chute://captures-changed",
      ] as const) {
        const dispose = await listen(event, () => {
          void refresh();
        });
        unsubscribers.push(dispose);
      }
    };
    void subscribe().catch(() => {});
    return () => {
      for (const dispose of unsubscribers) {
        try {
          dispose();
        } catch {
          // ignore
        }
      }
    };
  }, [refresh]);

  return { captures, loading, refresh };
}
