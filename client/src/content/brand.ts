// 심다 브랜드·프로젝트 데이터 (이주연 대표 이력서 2026.11 기준, Gemini Flash 정리)
export type ProjectCategory = "정원" | "조경" | "플랜트" | "연출" | "유지관리" | "교육" | "기획" | "언론" | "공공" | "서비스";

export const stats: { value: string; label: string }[] = [
  { value: "3", label: "등록특허" },
  { value: "5억", label: "R&D 확보" },
  { value: "100+", label: "대외 프로젝트" },
  { value: "2", label: "공식 수상" },
  { value: "2016", label: "설립연도" }
];

export const founder: { name: string; title: string; career: string[] } = {
  name: "이주연",
  title: "국내 1호 식물 큐레이터",
  career: [
    "2009.09 — 2012.04 제18대 국회의원사무실 정책비서 (관세청, 통계청, 여성가족부 담당)",
    "2012.06 — 2014.02 홍익대학교 사범대학 부속 여자고등학교 영어과 교사",
    "2016.04 — 현재 심다(simda) 창업 / 대표",
    "2021.09 — 현재 ㈜에스아이엠지오(SIMGO) 대표이사"
  ]
};

export const company = {
  name: "주식회사 에스아이엠지오",
  brand: "simda",
  tagline: "식물과 함께하는 일상의 큐레이션",
  registrationNumber: "574-88-02211",
  address: "서울특별시 서초구 바우뫼로6길 22, 2층 1호",
  phone: "1551-0525",
  email: "simda@simda.kr",
  hours: "평일 09:00–18:00"
};

export const milestones: { date: string; title: string; detail?: string; tag: "PATENT" | "CERT" | "AWARD" | "SELECT" | "FUND" | "MVP" }[] = [
  {
    date: "2025.11.05",
    title: "특허 등록 완료",
    detail: "사용자 위치를 활용한 지역 기반 비대면 식물 입찰 구매 및 판매 플랫폼 서비스 제공 방법, 장치 및 시스템 (등록번호 10-2884048호)",
    tag: "PATENT"
  },
  {
    date: "2025.02.13",
    title: "특허 출원 등록 완료",
    detail: "생성형 인공지능 모델을 활용한 자연어 처리 기반 대화형 식물 추천 서비스 제공 방법, 장치 및 시스템 (등록번호 10-2769887호)",
    tag: "PATENT"
  },
  {
    date: "2024.12",
    title: "여성기업 인증 갱신 완료",
    tag: "CERT"
  },
  {
    date: "2024.06",
    title: "벤처기업 인증 완료",
    tag: "CERT"
  },
  {
    date: "2024.05",
    title: "AI 식물 큐레이션 서비스 시제품 개발",
    tag: "MVP"
  },
  {
    date: "2023 — 2026",
    title: "한국농업기술진흥원 벤처육성기업 4년 연속 선정",
    detail: "2023 · 2024 · 2025 · 2026",
    tag: "SELECT"
  },
  {
    date: "2023.10.24",
    title: "비즈한국 오브젝트 바이 프라이즈 수상",
    detail: "'베스트 스페이스' 부문 수상 — 굿즈 오프라인 부문 (나인원한남 고메이494 한남 공간 팝업)",
    tag: "AWARD"
  },
  {
    date: "2023.06.05",
    title: "신용보증기금 스텝업 보증",
    detail: "혁신스타트업 성장지원 프로그램 · 연구 개발 단계 스텝업 보증으로 R&D 자금 5억 확보",
    tag: "FUND"
  },
  {
    date: "2023.06.01",
    title: "데이터 바우처 지원 사업 선정",
    tag: "SELECT"
  },
  {
    date: "2023.05.15",
    title: "퓨처파운드 샌드박스 프로그램 인큐베이팅 선발",
    tag: "SELECT"
  },
  {
    date: "2022.08.04",
    title: "특허 등록 완료",
    detail: "인공지능 기반 식물 정보 큐레이션 서비스 제공 방법, 장치 및 시스템 (등록번호 10-2430959-00-00)",
    tag: "PATENT"
  },
  {
    date: "2022.05.16",
    title: "기업부설 연구부서 설립",
    tag: "CERT"
  },
  {
    date: "2021.11.11",
    title: "여성기업 인증 완료",
    tag: "CERT"
  }
];

export const awards: { date: string; title: string; org: string }[] = [
  {
    date: "2023.06",
    title: "오브젝트 바이 프라이즈 '베스트 스페이스' 부문",
    org: "비즈한국"
  },
  {
    date: "2018.10",
    title: "대한민국 한평정원 유형1 우수상 '순천시장상'",
    org: "순천만 국가정원"
  }
];

export const media: { date: string; outlet: string; title: string }[] = [
  {
    date: "2023.11",
    outlet: "브리크매거진",
    title: "'일상의 큐레이터들에게 묻다' 인터뷰"
  },
  {
    date: "2023.10",
    outlet: "비즈한국",
    title: "2023 '오브젝트 바이 프라이즈' 베스트 스페이스 부문 수상"
  },
  {
    date: "2022.01",
    outlet: "천재교육 우등생논술",
    title: "'당신의 식물 생활을 도와 드립니다 — 식물 큐레이터 이주연' 편"
  },
  {
    date: "2021.10",
    outlet: "문화체육관광부 〈공감〉 유튜브",
    title: "정책 주간지 〈공감〉 유튜브 채널 출연"
  },
  {
    date: "2021.07",
    outlet: "월간커피",
    title: "식물 큐레이션 코너 연재 (~2022.01)"
  },
  {
    date: "2020.11",
    outlet: "KBS 아침1라디오",
    title: "'나의 작은 식물원' 진행 (~현재)"
  }
];

export const clients: string[] = [
  "아모레퍼시픽",
  "삼성물산",
  "신세계",
  "한화갤러리아",
  "현대백화점",
  "롯데백화점",
  "GS칼텍스",
  "신세계인터내셔날",
  "삼성카드",
  "국민카드",
  "캘러웨이코리아",
  "아스트라제네카",
  "HSBC",
  "한국토지주택공사(LH)",
  "서울시",
  "문화체육관광부",
  "한국농업기술진흥원",
  "신용보증기금",
  "법무법인 넥서스",
  "마이리얼트립",
  "오텍캐리어",
  "청년사관학교",
  "클래스101",
  "스타일난다",
  "이마트",
  "CJ ENM(CJ오쇼핑)",
  "와디즈",
  "컴패션",
  "서울시민대학",
  "서울평생교육진흥원",
  "대우건설",
  "삼성물산 건설부문(래미안)",
  "이오테크닉스",
  "골든듀",
  "조이그라이슨",
  "앤더슨벨",
  "브리즘",
  "오페라박물관",
  "피스피스",
  "광주비엔날레(광주폴리)"
];

export const projects: { year: number; month: string; category: ProjectCategory; title: string }[] = [
  { year: 2026, month: "08", category: "정원", title: "신사동 퀀텀빌딩 정원 디자인 및 시공" },
  { year: 2026, month: "08", category: "정원", title: "우면동 형촌마을 주택 정원 디자인 및 시공" },
  { year: 2026, month: "06", category: "플랜트", title: "개인 주택 테라스 연출" },
  { year: 2026, month: "06", category: "플랜트", title: "오아제 커뮨 식물 연출" },
  { year: 2026, month: "05", category: "정원", title: "닥터스피부과 신사별관 · 신사본관 정원 디자인 및 시공" },
  { year: 2026, month: "05", category: "정원", title: "삼청동 한옥 주택 정원 디자인 및 시공" },
  { year: 2026, month: "04", category: "정원", title: "오텍캐리어 정원 디자인 및 시공" },
  { year: 2026, month: "04", category: "정원", title: "나인원한남 개인 세대 정원 디자인 및 시공" },
  { year: 2026, month: "04", category: "정원", title: "삼덕유화㈜ 송도 골프빌라 정원 디자인 및 시공" },
  { year: 2026, month: "04", category: "정원", title: "링컨하우스 테라스 정원 조성" },
  { year: 2026, month: "03", category: "정원", title: "성수동 윤슬빌딩 팟가든 디자인 및 시공" },
  { year: 2025, month: "~12", category: "유지관리", title: "법무법인 넥서스 조경유지관리 (2024.09 ~ 2025.12)" },
  { year: 2025, month: "~12", category: "유지관리", title: "청년사관학교 강동캠퍼스 식물유지관리 (2023.01 ~ 2025.12)" },
  { year: 2025, month: "09", category: "정원", title: "피스피스 파주 출판단지점 정원 디자인 및 시공" },
  { year: 2025, month: "09", category: "정원", title: "브리즘 성수동 정원 디자인 및 시공" },
  { year: 2025, month: "09", category: "정원", title: "오페라박물관 조경 디자인 및 시공" },
  { year: 2025, month: "05", category: "기획", title: "아모레퍼시픽 공병 가드닝 운영 (교육 · 기획)" },
  { year: 2025, month: "05", category: "플랜트", title: "㈜이안리테일 팝업 식물 연출" },
  { year: 2025, month: "04", category: "플랜트", title: "헤이즈밀 베이커리 식물 연출" },
  { year: 2025, month: "03, 06", category: "교육", title: "신세계 아카데미 가드닝클래스" },
  { year: 2025, month: "03", category: "플랜트", title: "삼성물산 슬로웨어 현대무역센터점 디스플레이" },
  { year: 2025, month: "03", category: "플랜트", title: "이현어패럴 식물 연출" },
  { year: 2024, month: "11", category: "정원", title: "진주 충무공 개인 주택 조경디자인 및 시공" },
  { year: 2024, month: "10", category: "정원", title: "경옥채 한남점 화단 디자인 및 시공" },
  { year: 2024, month: "10", category: "정원", title: "노스텔지어 한옥호텔 누크재 조경 디자인 및 시공" },
  { year: 2024, month: "09", category: "정원", title: "유아가구 브랜드 탬버린하우스 조경 디자인 및 시공" },
  { year: 2024, month: "08", category: "연출", title: "일호점미역 수원점 조화조경 디자인 및 연출" },
  { year: 2024, month: "07", category: "서비스", title: "식물이사 서비스 런칭" },
  { year: 2024, month: "06", category: "기획", title: "제5차 광주폴리 '순환폴리(Air Folly)' 식물 큐레이션 참여" },
  { year: 2024, month: "05", category: "기획", title: "갤러리아 명품관 '난향천리 — 선물전' 팝업 기획 및 전시" },
  { year: 2023, month: "11", category: "언론", title: "브리크매거진 '일상의 큐레이터들에게 묻다' 인터뷰" },
  { year: 2023, month: "11", category: "정원", title: "한남동 메종마레 정원 설계 및 조성" },
  { year: 2023, month: "10", category: "언론", title: "2023 '오브젝트 바이 프라이즈' 베스트 스페이스 부문 수상" },
  { year: 2023, month: "10", category: "정원", title: "한남동 주머니빌라 주택 정원 설계 및 조성" },
  { year: 2023, month: "10", category: "정원", title: "함께크는어린이집 정원 설계 및 조성" },
  { year: 2023, month: "09", category: "기획", title: "2023 대한민국 도시농업박람회 참가" },
  { year: 2023, month: "07", category: "연출", title: "클린업키친 나인원한남 고메494 팝업 디스플레이 작업" },
  { year: 2023, month: "07", category: "교육", title: "컴패션 × 삼성 강남 식물생활 워크샵" },
  { year: 2023, month: "07", category: "교육", title: "〈도시명상〉 가드닝 명상 클래스" },
  { year: 2023, month: "06", category: "기획", title: "심다 × 컴패션 수경식물키트 제작 및 런칭" },
  { year: 2023, month: "06", category: "교육", title: "책방사춘기 '마음에 심는 식물' — 식재 치유 워크샵" },
  { year: 2023, month: "05", category: "연출", title: "롯데아트페어 부산 — 도자기 파편 식물 연출" },
  { year: 2023, month: "04", category: "기획", title: "나인원한남 한화갤러리아 고메이494 전체 공간 팝업 '봄, 심다'" },
  { year: 2023, month: "03", category: "조경", title: "진안 개인 주택 조경디자인 및 시공" },
  { year: 2023, month: "02", category: "연출", title: "라이즈앤빌로우 룩북 촬영 · 현대백화점 판교점 스토어 연출" },
  { year: 2023, month: "02", category: "연출", title: "스타일난다 3CE 플래그십 스토어 조경 연출" },
  { year: 2023, month: "01", category: "기획", title: "어랏 커뮤니티 참여 · 월간초심 런칭 · 2023 호텔페어 살구 부스" },
  { year: 2023, month: "01", category: "교육", title: "용인시농업기술센터 도시농업(홈가드닝) 강의" },
  { year: 2023, month: "—", category: "교육", title: "서울시민대학 '국내 1호 식물큐레이터와 함께 반려식물생활 시작하기'" },
  { year: 2022, month: "12", category: "정원", title: "TWW 숏텀 플래그십 스토어 연출 참여" },
  { year: 2022, month: "12", category: "연출", title: "조이그라이슨 도산 플래그십 스토어 화단 및 식물 연출" },
  { year: 2022, month: "11", category: "정원", title: "논현 아펠바움 2차 정원" },
  { year: 2022, month: "10", category: "조경", title: "앤더슨벨 경복궁 플래그십 스토어 조경 · 익산 카페 덕기 조경" },
  { year: 2022, month: "09", category: "플랜트", title: "신세계 인터내셔널 델라라나 식물 연출 · 롯데본점 골든듀 식물 연출" },
  { year: 2022, month: "09", category: "조경", title: "세종시 도담동 개인 주택 조경" },
  { year: 2022, month: "09", category: "연출", title: "래미안 갤러리 내 베리키친 얼스피릿 조경 연출" },
  { year: 2022, month: "08", category: "교육", title: "마포구립서강도서관 '일상의 벗, 식물 생활 시작하기' 인문학 강연" },
  { year: 2022, month: "08", category: "교육", title: "GS칼텍스 임직원 대상 '에코플러스화분' 440개 심기 교육" },
  { year: 2022, month: "08", category: "조경", title: "세종시 반곡동 개인 주택 준공 조경" },
  { year: 2022, month: "06", category: "정원", title: "양평 문호리 개인 주택 조경" },
  { year: 2022, month: "05", category: "플랜트", title: "더일마 매장 연출" },
  { year: 2022, month: "05", category: "교육", title: "'행복이 가득한 집' 구독자 대상 마다가스카르 자스민 워크숍" },
  { year: 2022, month: "05", category: "연출", title: "자쓰리헤어 도곡점 화단 및 식물 연출 · 피스피스 출판단지점 연출" },
  { year: 2022, month: "04", category: "교육", title: "부산 금샘누리유치원 교사 및 학부모 대상 '생태 교육'" },
  { year: 2022, month: "04", category: "교육", title: "국민카드 × 영등포초등학교 식목일 기념 '지구에 착한 화분에 식물 심기'" },
  { year: 2022, month: "03", category: "교육", title: "월간초심 '식물로 하는 대화' 학자스민편 워크숍" },
  { year: 2022, month: "01", category: "교육", title: "제주유아교육진흥원 식물과 함께하는 힐링교실 직무연수" },
  { year: 2022, month: "01", category: "언론", title: "천재교육 우등생논술 '당신의 식물 생활을 도와 드립니다 — 식물 큐레이터 이주연' 편" },
  { year: 2021, month: "12", category: "교육", title: "컬쳐클럽(이마트트레이더스 × 셀레브) '식물 생활 시작하기' — 이마트 부산 명지점 · 수원점" },
  { year: 2021, month: "11", category: "교육", title: "한국교원대 유아교육원 유아교육 핵심리더 직무연수 1기/2기 — '나의 리틀 포레스트, 인생 정원'" },
  { year: 2021, month: "11", category: "교육", title: "삼성카드 열린멘토링 10기 연합활동 위메프 지식생키트 체험 교육" },
  { year: 2021, month: "10", category: "기획", title: "통의동 아트스페이스 보안 〈국화〉 전시 참여 · 대우 푸르지오 홈가드닝 키트 부문 낙찰" },
  { year: 2021, month: "10", category: "교육", title: "판교환경생태학습원 워라밸 Eco Class '식물 큐레이션' 클래스" },
  { year: 2021, month: "10", category: "교육", title: "LH 멘토와 꼬마친구 발대식 '식물 키트 만들기' 수업" },
  { year: 2021, month: "10", category: "언론", title: "문화체육관광부 정책 주간지 〈공감〉 유튜브 채널 출연" },
  { year: 2021, month: "09", category: "교육", title: "서울시 평생교육진흥원 모두의 학교 '나의 식물 성장기' 강의" },
  { year: 2021, month: "09", category: "교육", title: "충남도교육청 평생교육원 독서의 달 특강 — '책과 식물로 평온한 하루, 집 안 정원 꾸미기'" },
  { year: 2021, month: "09", category: "교육", title: "서부교육지원청 관내 초등학교 교원 생태전환교육 직무연수" },
  { year: 2021, month: "09", category: "교육", title: "롯데캐슬 유튜브채널 '오캐롯캐' 집콕 레슨 강의" },
  { year: 2021, month: "08", category: "교육", title: "아스트라제네카 희망샘 여름방학특강 — 힐링샘 마음챙김 반려식물 큐레이션" },
  { year: 2021, month: "07", category: "공공", title: "이문동 가드닝프로젝트 '링링링' 케어링 — 식물 큐레이션 with 만아츠만액츠" },
  { year: 2021, month: "07", category: "언론", title: "월간커피 식물 큐레이션 코너 연재 (~2022.01)" },
  { year: 2021, month: "07", category: "교육", title: "서울시 평생교육진흥원 모두의 학교 소울플랜트 강의" },
  { year: 2021, month: "07", category: "교육", title: "컬쳐클럽(이마트트레이더스 × 셀레브) — 이마트 부산 연산점" },
  { year: 2021, month: "06", category: "교육", title: "HSBC 임직원 교육 (100여 명)" },
  { year: 2021, month: "06", category: "교육", title: "서부교육지원청(강서양천교육청) 초등교사 생태전환교육 직무연수" },
  { year: 2021, month: "05", category: "교육", title: "서울시 평생교육원 모두의학교 강의 및 커뮤니티 컨설팅" },
  { year: 2021, month: "05", category: "교육", title: "㈜클래스101 '나의 취향으로 완성하는 반려식물생활' 식물 큐레이션 클래스" },
  { year: 2021, month: "02", category: "유지관리", title: "캘러웨이 코리아 식물 유지 관리 서비스 시작 (~현재)" },
  { year: 2020, month: "12", category: "플랜트", title: "캘러웨이 코리아 사옥 4·5·6·7층 식물 연출 (~현재)" },
  { year: 2020, month: "12", category: "플랜트", title: "신세계 인터내셔널 톰보이스튜디오 식물 연출 — 롯데본점 · 동탄 · 대전 · 동부산 · 의왕 · 평촌 (~2021.09)" },
  { year: 2020, month: "11", category: "언론", title: "KBS 아침1라디오 '나의 작은 식물원' 진행 (~현재)" },
  { year: 2020, month: "07", category: "플랜트", title: "삼성물산 한섬 플랜트 인테리어" },
  { year: 2020, month: "06", category: "기획", title: "통의동 아트스페이스 보안 〈식물계〉 전시" },
  { year: 2020, month: "06", category: "기획", title: "와디즈 '식물 생활 키트' 런칭 및 크라우드 펀딩 2,311% 달성" },
  { year: 2020, month: "05", category: "조경", title: "진주 충무공동 개인 주택 이끼 정원 및 그라스 정원 조성" },
  { year: 2020, month: "04", category: "기획", title: "CJ오쇼핑 오덴세 토분 브랜드 런칭 전문가 초청 홈쇼핑 — 완판" },
  { year: 2019, month: "06", category: "교육", title: "오덴세 2nd floor '식물과 사는 처음의 마음' 강의" },
  { year: 2019, month: "04", category: "정원", title: "천안 베이커리카페 뚜쥬루 온실 및 화단 조성" },
  { year: 2018, month: "10", category: "공공", title: "서울정원박람회 정원에 차린 식탁 진행" },
  { year: 2018, month: "09", category: "공공", title: "서울정원박람회 메인 무대 '정원' 컨셉 조성" },
  { year: 2018, month: "01", category: "공공", title: "한화예술더하기 9주년 식물 디스플레이" },
  { year: 2017, month: "10", category: "공공", title: "서울시 돈의문 박물관마을 아트페이빙 식물 연출" }
];

export const ongoing: { plantCare: string[]; landscapeCare: string[] } = {
  plantCare: [
    "강남성모병원 평생건강증진센터",
    "마이리얼트립 오피스",
    "캘러웨이코리아 사옥 전체",
    "헤이즈밀베이커리 실외 및 실내"
  ],
  landscapeCare: [
    "나인원한남 개인 세대 정원",
    "논현 아펠바움 2차 개인 세대 정원",
    "오페라박물관",
    "법무법인 넥서스 옥상 정원",
    "한남동 주머니빌라 개인 세대 정원",
    "송도 잭니클라우스 골프클럽코리아 개인 주택 조경",
    "㈜이오테크닉스 사옥"
  ]
};
