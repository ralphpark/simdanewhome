import { useSyncExternalStore } from "react";
import { siteTexts, type SiteTextKey } from "@/content/siteTexts";

export type SiteTextDrafts = Partial<Record<SiteTextKey, string | null>>;
const empty: SiteTextDrafts = {};
let drafts: SiteTextDrafts = empty;
const listeners = new Set<() => void>();
export function isSiteTextPreview() {
  return typeof window !== "undefined" && window.parent !== window && new URLSearchParams(window.location.search).get("textPreview") === "1";
}
function receive(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.source !== window.parent) return;
  if (event.data?.type === "site-text-drafts" && event.data.drafts && typeof event.data.drafts === "object" && !Array.isArray(event.data.drafts)) {
    drafts = Object.fromEntries(Object.entries(event.data.drafts).filter(([key, value]) => Object.hasOwn(siteTexts, key) && (value === null || typeof value === "string")));
    listeners.forEach(listener => listener());
  }
  if (event.data?.type === "site-text-focus" && typeof event.data.key === "string" && Object.hasOwn(siteTexts, event.data.key)) {
    const target = document.querySelector<HTMLElement>(`[data-site-text-key="${event.data.key}"]`);
    if (target) {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      target.animate([{ outline: "2px solid #16a34a", backgroundColor: "#dcfce780" }, { outline: "2px solid transparent", backgroundColor: "transparent" }], { duration: 1600 });
    }
  }
}
function subscribe(listener: () => void) {
  if (!isSiteTextPreview()) return () => {};
  if (listeners.size === 0) {
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "site-text-ready" }, window.location.origin);
  }
  listeners.add(listener);
  return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener("message", receive); };
}
export function useSiteTextDrafts() {
  return useSyncExternalStore(subscribe, () => isSiteTextPreview() ? drafts : empty, () => empty);
}
