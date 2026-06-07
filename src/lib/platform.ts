/**
 * Lightweight platform detection for the webview. Apple Notes is macOS-only,
 * so we use this to gate that destination in the UI and sync engine.
 */
export function isMacOS(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent || "";
  const platform = (navigator as Navigator & { platform?: string }).platform || "";
  return /Mac/i.test(platform) || /Mac OS X|Macintosh/i.test(ua);
}
