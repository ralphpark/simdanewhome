// 사이트 기본 이미지(승인 시안의 로컬 사진 및 기존 사진). 관리자 '사이트 사진'에서 교체하면 DB 값이 우선한다.
// 순서는 사이트에 나오는 순서이고, 관리자 화면 카드 순서도 이 순서를 따른다.
export const siteImageKeys = [
  "home.hero",
  "home.care",
  "home.education",
  "home.landscape",
  "home.sales",
  "home.platform",
  "home.story",
  "home.gift",
  "home.work2",
  "home.work3",
  "story.opening",
  "story.philosophy",
  "services.platform",
  "services.care",
  "services.education",
  "services.landscape",
  "services.sales",
  "portfolio.hero",
  "magazine.hero",
  "b2b.hero",
] as const;

export type SiteImageKey = (typeof siteImageKeys)[number];
export type SiteImage = { url: string; alt: string; credit?: string };

export const defaultImages: Record<SiteImageKey, SiteImage> = {
  "home.hero": { url: "/images/home/hero.jpg", alt: "햇살이 드는 밝은 실내의 큰 식물", credit: "Unsplash · 시안 임시 사진" },
  "home.care": { url: "/images/home/plant-studio.jpg", alt: "밝은 사무실의 식물", credit: "Unsplash · 시안 임시 사진" },
  "home.education": { url: "/images/home/education.jpg", alt: "밝은 테이블에서 식물을 옮겨 심는 손", credit: "Unsplash · 시안 임시 사진" },
  "home.landscape": { url: "/images/home/landscape.jpg", alt: "밝은 현대식 정원", credit: "Unsplash · 시안 임시 사진" },
  "home.sales": { url: "/images/home/sales.jpg", alt: "흰 배경 앞의 화분들", credit: "Unsplash · 시안 임시 사진" },
  "home.platform": { url: "/images/home/platform.jpg", alt: "꽃과 식물이 놓인 밝은 꽃집", credit: "Unsplash · 시안 임시 사진" },
  "home.story": { url: "/images/home/work1.jpg", alt: "오페라박물관 테라스 정원", credit: "Unsplash · 시안 임시 사진" },
  "home.gift": { url: "/images/home/plant-pot.jpg", alt: "흰 화분에 담긴 식물", credit: "Unsplash · 시안 임시 사진" },
  "home.work2": { url: "/images/home/work2.jpg", alt: "식물로 연출한 사무 공간", credit: "Unsplash · 시안 임시 사진" },
  "home.work3": { url: "/images/home/work3.jpg", alt: "식물로 연출한 매장", credit: "Unsplash · 시안 임시 사진" },
  "story.opening": { url: "/images/home/plant-studio.jpg", alt: "밝은 실내에서 식물과 함께하는 공간", credit: "Unsplash · 시안 임시 사진" },
  "story.philosophy": { url: "/images/home/education.jpg", alt: "흙에 식물을 심는 손", credit: "Unsplash · 시안 임시 사진" },
  "services.platform": { url: "/images/home/platform.jpg", alt: "식물이 놓인 작은 꽃집 외관", credit: "Our Latest Number / Unsplash" },
  "services.care": { url: "/images/home/plant-studio.jpg", alt: "햇살이 드는 사무실의 큰 실내 식물", credit: "FlippingBook / Unsplash" },
  "services.education": { url: "/images/home/education.jpg", alt: "야외 테이블 위의 꽃 꽂이 작업", credit: "Joshua Soliz / Unsplash" },
  "services.landscape": { url: "/images/home/landscape.jpg", alt: "식물과 야외 가구가 놓인 나무 데크", credit: "Cameron Smith / Unsplash" },
  "services.sales": { url: "/images/home/sales.jpg", alt: "벽 앞에 줄지어 놓인 화분들", credit: "Ilker Ozmen / Unsplash" },
  "portfolio.hero": { url: "/images/home/work1.jpg", alt: "식물과 함께하는 테라스 정원", credit: "Unsplash · 시안 임시 사진" },
  "magazine.hero": { url: "/images/home/education.jpg", alt: "함께 식물을 돌보는 일상", credit: "Unsplash · 시안 임시 사진" },
  "b2b.hero": { url: "/images/home/work2.jpg", alt: "식물로 연출한 기업 공간", credit: "Unsplash · 시안 임시 사진" },
};

// 키 앞부분(home, story …)이 페이지다. 순서는 사이트 메뉴 순서. 새 페이지 접두어를 쓰면 여기 이름이 없어 타입 검사에서 걸린다.
type PageOf<K> = K extends `${infer Page}.${string}` ? Page : never;
export type SiteImagePage = PageOf<SiteImageKey>;
export const siteImagePageLabels: Record<SiteImagePage, string> = {
  home: "홈",
  story: "브랜드 스토리",
  services: "서비스",
  portfolio: "포트폴리오",
  magazine: "매거진",
  b2b: "고객센터 (B2B 협업)",
};

// 관리자 화면 안내. 가장 크게 쓰이는 곳 기준. 가변 크기는 1440 × 900 화면에서 측정했다.
// 전체 사진: 1440/900, 홈 서비스 카드: 960/(900*.58-150), 작업 카드: ((1440-36)/2)/580.
// 화면 폭을 꽉 채우는 사진은 가로 2400px, 그 밖의 가로 사진은 가로 1600px 이상을 권한다.
export type SiteImageGuide = { label: string; where: string; ratio: string; ratioLabel?: string; size: string };
const full = "가로 2400px 이상";
const wide = "가로 1600px 이상";
export const siteImageGuides: Record<SiteImageKey, SiteImageGuide> = {
  "home.hero": { label: "첫 화면 큰 사진", where: "홈 맨 위. 스크롤하면 화면 전체로 커집니다. 매거진 글이나 사진이 없거나 사진을 불러오지 못하면 홈 '매거진' 칸에도 나옵니다.", ratio: "8/5", size: full },
  "home.care": { label: "식물관리 서비스 사진", where: "홈 '심다를 한눈에.'의 식물관리 카드. 매거진 글이나 사진이 없거나 사진을 불러오지 못하면 홈 '매거진' 칸에도 나옵니다.", ratio: "80/31", ratioLabel: "약 5:2", size: wide },
  "home.education": { label: "교육 서비스 사진", where: "홈 '심다를 한눈에.'의 교육 카드.", ratio: "80/31", ratioLabel: "약 5:2", size: wide },
  "home.landscape": { label: "조경 서비스 사진", where: "홈 '심다를 한눈에.'의 조경 카드.", ratio: "80/31", ratioLabel: "약 5:2", size: wide },
  "home.sales": { label: "판매 서비스 사진", where: "홈 '심다를 한눈에.'의 판매 카드.", ratio: "80/31", ratioLabel: "약 5:2", size: wide },
  "home.platform": { label: "simda 플랫폼 사진", where: "홈 '심다를 한눈에.'의 simda 플랫폼 카드. 아래 휴대폰 그림의 '동네 꽃집' 작은 사진과, 컴퓨터 화면에서 휴대폰 옆에 뜨는 사진 카드에도 나옵니다.", ratio: "80/31", ratioLabel: "약 5:2", size: wide },
  "home.story": { label: "브랜드 스토리 큰 사진", where: "홈 '식물로 공간을 바꿉니다.' 아래. 스크롤하면 화면 전체로 커집니다. 포트폴리오 작업이나 사진이 없거나 사진을 불러오지 못하면 홈 '공간이 달라졌습니다.' 칸에도 나옵니다.", ratio: "8/5", size: full },
  "home.gift": { label: "선물 도착 사진", where: "홈 휴대폰 그림의 '선물이 도착했습니다.' 사진, 컴퓨터 화면에서 휴대폰 옆에 뜨는 사진 카드, 서비스 페이지의 휴대폰 그림. 매거진 글이나 사진이 없거나 사진을 불러오지 못하면 홈 '매거진' 칸에도 나옵니다.", ratio: "16/10", size: wide },
  "home.work2": { label: "작업 소개 사진 (캘러웨이 코리아)", where: "홈 '공간이 달라졌습니다.' 첫째 칸. 첫째 작업의 사진이 없거나 불러오지 못할 때 나옵니다.", ratio: "351/290", ratioLabel: "약 6:5", size: wide },
  "home.work3": { label: "작업 소개 사진 (헤이즈밀 베이커리)", where: "홈 '공간이 달라졌습니다.' 둘째 칸. 둘째 작업의 사진이 없거나 불러오지 못할 때 나옵니다.", ratio: "351/290", ratioLabel: "약 6:5", size: wide },
  "story.opening": { label: "브랜드 스토리 첫 화면 사진", where: "브랜드 스토리 맨 위. 스크롤하면 화면 전체로 커집니다.", ratio: "8/5", size: full },
  "story.philosophy": { label: "심다 이름 이야기 사진", where: "브랜드 스토리 '풀의 마음과 처음의 마음.' 글 아래.", ratio: "16/9", size: wide },
  "services.platform": { label: "서비스 첫 화면 사진", where: "서비스 맨 위. 스크롤하면 화면 전체로 커집니다. 아래 'simda 플랫폼' 소개의 세로 사진에도 나옵니다.", ratio: "8/5", size: full },
  "services.care": { label: "식물 유지관리 사진", where: "서비스 '식물 유지관리' 소개.", ratio: "16/9", size: wide },
  "services.education": { label: "기업·기관 교육 사진", where: "서비스 '기업 및 기관 교육' 소개.", ratio: "16/9", size: wide },
  "services.landscape": { label: "조경·가든 디자인 사진", where: "서비스 '조경 및 가든 디자인' 소개.", ratio: "16/9", size: wide },
  "services.sales": { label: "플랜트 셀렉션 사진", where: "서비스 '플랜트 셀렉션' 소개.", ratio: "16/9", size: wide },
  "portfolio.hero": { label: "포트폴리오 첫 화면 사진", where: "포트폴리오 맨 위. 스크롤하면 화면 전체로 커집니다.", ratio: "8/5", size: full },
  "magazine.hero": { label: "매거진 대표 사진", where: "매거진 맨 위 대표 칸. 매거진 글이 하나도 없을 때만 나옵니다.", ratio: "2/1", size: wide },
  "b2b.hero": { label: "B2B 협업 첫 화면 사진", where: "고객센터 > B2B 협업 맨 위. 스크롤하면 화면 전체로 커집니다.", ratio: "8/5", size: full },
};
