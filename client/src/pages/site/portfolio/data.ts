import { useQuery } from "@tanstack/react-query";
import type { Portfolio } from "@shared/schema";
import { copy } from "@/content/copy";

export type PortfolioItem = Omit<Portfolio, "completedDate" | "createdAt" | "updatedAt"> & { completedDate: string | null };
const categories: Record<string, string> = {
  garden: "garden", gardens: "garden", gardening: "garden", 정원: "garden", 가든: "garden", 정원디자인: "garden",
  landscape: "landscape", landscaping: "landscape", outdoor: "landscape", exterior: "landscape", 조경: "landscape", 야외: "landscape", 실외: "landscape",
  plant: "plant", plants: "plant", indoor: "plant", office: "plant", residential: "plant", plantcare: "plant", maintenance: "plant", 플랜트: "plant", 식물: "plant", 실내: "plant", 유지관리: "plant", 식물관리: "plant", 플랜트인테리어: "plant",
  styling: "styling", display: "styling", interior: "styling", installation: "styling", 연출: "styling", 공간연출: "styling", 식물연출: "styling", 디스플레이: "styling",
  education: "education", workshop: "education", workshops: "education", class: "education", 교육: "education", 워크숍: "education", 클래스: "education",
  planning: "planning", exhibition: "planning", popup: "planning", event: "planning", public: "planning", service: "planning", press: "planning", 기획: "planning", 전시: "planning", 공공: "planning", 서비스: "planning", 언론: "planning",
};
/** Unknown values stay distinct and remain visible under All. */
export function categoryKey(value: string) {
  const key = (value || "").trim().toLowerCase().replace(/[\s_\-/·]/g, "");
  return categories[key] || key;
}
export function categoryLabel(value: string) {
  return copy.portfolio.filters.find(item => item.key === categoryKey(value))?.label || value || "프로젝트";
}
export function usePortfolios() { return useQuery<PortfolioItem[]>({ queryKey: ["/api/portfolios"] }); }
