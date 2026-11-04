import { useQuery } from "@tanstack/react-query";
import { defaultImages, type SiteImageKey } from "@/content/images";

export type SiteImageOverride = { key: string; url: string; alt: string | null; updatedAt: string };
export const siteImagesQueryKey = ["/api/site-images"] as const;

export function useSiteImages() {
  return useQuery<SiteImageOverride[]>({
    queryKey: siteImagesQueryKey,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/site-images", { signal });
      if (!response.ok) throw new Error("사이트 이미지를 불러오지 못했습니다");
      const result: unknown = await response.json();
      if (!Array.isArray(result)) throw new Error("사이트 이미지 응답이 올바르지 않습니다");
      return result.filter((row): row is SiteImageOverride => row && typeof row.key === "string" && typeof row.url === "string" && row.url.startsWith("https://") && (row.alt === null || typeof row.alt === "string"));
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useSiteImage(key: SiteImageKey): { url: string; alt: string } {
  const { data } = useSiteImages();
  const override = data?.find((image) => image.key === key);
  return override ? { url: override.url, alt: override.alt ?? defaultImages[key].alt } : defaultImages[key];
}
