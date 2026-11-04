// 사이트 기본 이미지(Unsplash). 관리자 '사이트 이미지'에서 교체하면 DB 값이 우선한다.
export const siteImageKeys = [
  "home.hero",
  "home.platform",
  "home.cta",
  "story.opening",
  "story.philosophy",
  "services.platform",
  "services.care",
  "services.education",
  "services.landscape",
  "services.sales",
  "support.hero",
  "b2b.hero",
  "booking.hero",
  "portfolio.hero",
  "magazine.hero",
] as const;

export type SiteImageKey = (typeof siteImageKeys)[number];
export type SiteImage = { url: string; alt: string; credit?: string };

export const defaultImages: Record<SiteImageKey, SiteImage> = {
  "home.hero": { url: "https://images.unsplash.com/photo-1774499647306-948c09257da7?auto=format&fit=crop&w=2400&q=80", alt: "흰 거울에 비친 야자나무 잎", credit: "Kristiina Klaas / Unsplash" },
  "home.platform": { url: "https://images.unsplash.com/photo-1585457273198-c58cfe7554ca?auto=format&fit=crop&w=2400&q=80", alt: "꽃과 식물이 진열된 꽃집 내부", credit: "Jason Leung / Unsplash" },
  "home.cta": { url: "https://images.unsplash.com/photo-1547936785-c57315d64694?auto=format&fit=crop&w=2400&q=80", alt: "가까이서 본 초록 잎의 질감", credit: "Bence Balla-Schottner / Unsplash" },
  "story.opening": { url: "https://images.unsplash.com/photo-1623136299195-570a06bdae6b?auto=format&fit=crop&w=2400&q=80", alt: "고요한 분위기의 초록 식물 온실", credit: "Katrien Van crombrugghe / Unsplash" },
  "story.philosophy": { url: "https://images.unsplash.com/photo-1597868165956-03a6827955b1?auto=format&fit=crop&w=2400&q=80", alt: "흙에 어린 묘목을 심는 손", credit: "Jonathan Kemper / Unsplash" },
  "services.platform": { url: "https://images.unsplash.com/photo-1770362603231-7c7b3a01d587?auto=format&fit=crop&w=2400&q=80", alt: "식물이 놓인 작은 꽃집 외관", credit: "Our Latest Number / Unsplash" },
  "services.care": { url: "https://images.unsplash.com/photo-1774853094610-89be6f1a7690?auto=format&fit=crop&w=2400&q=80", alt: "햇살이 드는 사무실의 큰 실내 식물", credit: "FlippingBook / Unsplash" },
  "services.education": { url: "https://images.unsplash.com/photo-1768874020251-28706ecd7821?auto=format&fit=crop&w=2400&q=80", alt: "야외 테이블 위의 꽃 꽂이 작업", credit: "Joshua Soliz / Unsplash" },
  "services.landscape": { url: "https://images.unsplash.com/photo-1617850687395-620757feb1f3?auto=format&fit=crop&w=2400&q=80", alt: "식물과 야외 가구가 놓인 나무 데크", credit: "Cameron Smith / Unsplash" },
  "services.sales": { url: "https://images.unsplash.com/photo-1730195986404-2749e395935e?auto=format&fit=crop&w=2400&q=80", alt: "벽 앞에 줄지어 놓인 화분들", credit: "Ilker Ozmen / Unsplash" },
  "support.hero": { url: "https://images.unsplash.com/photo-1625585598750-3535fe40efb3?auto=format&fit=crop&w=2400&q=80", alt: "밝고 단정한 방 안의 산세베리아", credit: "Andrew Neel / Unsplash" },
  "b2b.hero": { url: "https://images.unsplash.com/photo-1718220268527-4477fd170775?auto=format&fit=crop&w=2400&q=80", alt: "큰 창이 있는 기업 로비와 실내 식물", credit: "Bernd Dittrich / Unsplash" },
  "booking.hero": { url: "https://images.unsplash.com/photo-1526761926463-7da0d0ed992d?auto=format&fit=crop&w=2400&q=80", alt: "아침 햇살 아래 놓인 식물 화분", credit: "Ben Lockwood, PhD / Unsplash" },
  "portfolio.hero": { url: "https://images.unsplash.com/photo-1784308992954-6c953b02f0a0?auto=format&fit=crop&w=2400&q=80", alt: "초록 중정과 나무가 있는 건축 공간", credit: "Shruti Singh / Unsplash" },
  "magazine.hero": { url: "https://images.unsplash.com/photo-1773867567771-c971dbab370b?auto=format&fit=crop&w=2400&q=80", alt: "어두운 화병과 유칼립투스 가지 정물", credit: "Franco Debartolo / Unsplash" },
};
