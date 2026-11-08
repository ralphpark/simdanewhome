import React, { Fragment, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { isSiteTextPreview, useSiteTextDrafts } from "./siteTextPreview";
import { siteTexts, type SiteTextKey } from "@/content/siteTexts";

export type SiteTextOverride = { key: string; value: string; updatedAt: string };
export const siteTextsQueryKey = ["/api/site-texts"] as const;

export function useSiteTexts() {
  return useQuery<SiteTextOverride[]>({
    queryKey: siteTextsQueryKey,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/site-texts", { signal });
      if (!response.ok) throw new Error("사이트 문구를 불러오지 못했습니다");
      const result: unknown = await response.json();
      if (!Array.isArray(result)) throw new Error("사이트 문구 응답이 올바르지 않습니다");
      return result.filter((row): row is SiteTextOverride => row && typeof row.key === "string" && typeof row.value === "string" && row.value.trim().length > 0 && row.value.length <= 2000);
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useSiteText() {
  const { data } = useSiteTexts();
  const drafts = useSiteTextDrafts();
  return (key: SiteTextKey): string => Object.hasOwn(drafts, key)
    ? drafts[key] ?? siteTexts[key].value
    : data?.find(row => row.key === key)?.value ?? siteTexts[key].value;
}

export type SiteTextPart = { text: string; emphasized: boolean };

/** Only paired ** markers are special. Unpaired markers, including HTML, stay text. */
export function parseSiteText(value: string): SiteTextPart[] {
  const parts = value.split("**");
  if (parts.length % 2 === 0) return [{ text: value, emphasized: false }];
  return parts.map((text, index) => ({ text, emphasized: index % 2 === 1 }));
}

export function renderSiteText(value: string, em: "b" | "grad" = "b"): ReactNode {
  return parseSiteText(value).map((part, index) => {
    const lines = part.text.split("\n").map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{line}</Fragment>);
    return part.emphasized ? em === "grad" ? <span className="grad" key={index}>{lines}</span> : <b key={index}>{lines}</b> : <Fragment key={index}>{lines}</Fragment>;
  });
}

export function SiteText({ k }: { k: SiteTextKey }) {
  const text = useSiteText();
  const content = renderSiteText(text(k), siteTexts[k].em);
  if (!isSiteTextPreview()) return <>{content}</>;
  // A neutral element avoids inheriting page rules that target every nested span.
  return React.createElement("site-text", {
    "data-site-text-key": k,
    style: { cursor: "text", pointerEvents: "auto", borderRadius: 2 },
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => { event.currentTarget.style.outline = "1px solid #16a34a"; },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => { event.currentTarget.style.outline = ""; },
    onClickCapture: (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault(); event.stopPropagation();
      window.parent.postMessage({ type: "site-text-select", key: k }, window.location.origin);
    },
  }, content);
}
