// Fixed configuration, metadata, contacts and form options. Editable copy lives in siteTexts.ts.
export const copy = {
  "services": {
    "sections": [
      {
        "key": "platform",
        "cta": {
          "href": "https://www.simda.me"
        }
      },
      {
        "key": "care",
        "cta": {
          "href": "/support/booking"
        }
      },
      {
        "key": "education",
        "cta": {
          "href": "/support/b2b"
        }
      },
      {
        "key": "landscape",
        "cta": {
          "href": "/support/b2b"
        }
      },
      {
        "key": "sales",
        "cta": {
          "href": "https://www.simda.me"
        }
      }
    ]
  },
  "portfolio": {
    "filters": [
      {
        "key": "all",
        "label": "전체"
      },
      {
        "key": "garden",
        "label": "정원"
      },
      {
        "key": "landscape",
        "label": "조경"
      },
      {
        "key": "plant",
        "label": "플랜트"
      },
      {
        "key": "styling",
        "label": "연출"
      },
      {
        "key": "education",
        "label": "교육"
      },
      {
        "key": "planning",
        "label": "기획"
      }
    ],
    "next": {
      "label": "다음 프로젝트"
    }
  },
  "magazine": {
    "empty": "준비된 글이 없습니다."
  },
  "support": {
    "contact": {
      "phone": "1551-0525",
      "email": "simda@simda.kr",
      "hours": "평일 09:00–18:00"
    },
    "cards": [
      {
        "href": "/support/b2b"
      },
      {
        "href": "/support/booking"
      }
    ]
  },
  "booking": {
    "steps": [
      "상담 유형",
      "희망 일정",
      "연락처",
      "확인"
    ],
    "types": [
      {
        "value": "plant-care",
        "label": "식물관리",
        "lead": "오피스 및 상업 시설의 정기 유지관리 솔루션 상담"
      },
      {
        "value": "education",
        "label": "교육",
        "lead": "기업 사내 워크숍 및 기관 단체 클래스 구성 문의"
      },
      {
        "value": "landscape",
        "label": "조경",
        "lead": "주택 정원, 테라스, 상업 공간 조경 디자인 및 시공"
      },
      {
        "value": "sales",
        "label": "판매",
        "lead": "공간 맞춤 대형 화분 및 특정 수종 셀렉션 견적"
      },
      {
        "value": "other",
        "label": "기타",
        "lead": "팝업 전시, 방송, 브랜드 콜라보레이션 등 기타 프로젝트"
      }
    ]
  },
  "footer": {
    "company": "주식회사 에스아이엠지오",
    "bizNo": "574-88-02211",
    "address": "서울특별시 서초구 바우뫼로6길 22, 2층 1호"
  },
  "seo": {
    "/": {
      "title": "심다 (simda) — 식물과 함께하는 일상의 큐레이션",
      "description": "공간의 결에 맞는 식재 연출, 정기 유지관리, 정원 조경 및 위치 기반 선물 플랫폼 simda를 선보입니다."
    },
    "/story": {
      "title": "브랜드 스토리 — 심다 (simda)",
      "description": "국내 1호 식물 큐레이터의 철학과 초심, 그리고 2016년부터 이어온 100여 건의 대외 프로젝트 기록."
    },
    "/services": {
      "title": "서비스 — 심다 (simda)",
      "description": "simda 플랫폼, 전문 식물관리, 기업 출강 교육, 가든 조경 설계, 식물 셀렉션 판매를 안내합니다."
    },
    "/portfolio": {
      "title": "포트폴리오 — 심다 (simda)",
      "description": "나인원한남, 캘러웨이 코리아 등 다양한 상업·주거 공간에 심다가 구현한 식물 큐레이션 작업물."
    },
    "/magazine": {
      "title": "매거진 — 심다 (simda)",
      "description": "식물을 돌보며 마주하는 계절의 변화와 일상 속 영감을 차분한 이야기로 전합니다."
    },
    "/support": {
      "title": "고객센터 — 심다 (simda)",
      "description": "유지관리 주기, 비용 견적 등 자주 묻는 질문과 큐레이터 상담 문의 창구를 안내합니다."
    },
    "/support/b2b": {
      "title": "B2B 협업 문의 — 심다 (simda)",
      "description": "사옥 플랜트 인테리어, 정기 케어, 대규모 단체 임직원 워크숍 등 맞춤형 B2B 솔루션을 제안합니다."
    },
    "/support/booking": {
      "title": "상담 예약 — 심다 (simda)",
      "description": "전문 식물 큐레이터와 함께하는 체계적인 1:1 공간 식재 및 조경 상담 일정을 예약하세요."
    }
  }
} as const;
