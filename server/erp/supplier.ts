const SUPPLIER_INDUSTRIES: Readonly<Record<string, { businessType: string; businessItem: string }>> = {
  "정기 식물관리": { businessType: "사업시설 관리, 사업지원 및 임대 서비스업", businessItem: "조경관리 및 유지 서비스업" },
  "식물·화분 납품": { businessType: "도매 및 소매업", businessItem: "조경 및 화훼류 관련 도소매업" },
  "정원·조경 설계": { businessType: "전문, 과학 및 기술서비스업", businessItem: "조경 설계 서비스업" },
  "공간 컨설팅": { businessType: "전문, 과학 및 기술서비스업", businessItem: "공간디자인 컨설팅업" },
  "디자인": { businessType: "전문, 과학 및 기술서비스업", businessItem: "시각 디자인업" },
  "교육·클래스": { businessType: "교육서비스업", businessItem: "교육서비스업" },
  "온라인 판매": { businessType: "도매 및 소매업", businessItem: "전자상거래업" },
  "소프트웨어": { businessType: "정보통신업", businessItem: "응용 소프트웨어 개발 및 공급업" },
};

const supplier = {
  identificationNumber: "5748802211",
  taxRegistrationId: null,
  organizationName: "주식회사 에스아이엠지오",
  representativeName: "이주연",
  address: "서울특별시 서초구 바우뫼로6길 22, 2층 1호 201호 (우면동, 우현)",
  manager: { email: "simgokr@gmail.com", name: "이주연", telephone: null },
};

export function supplierForIndustry(industry: string | null) {
  const selection = industry && Object.hasOwn(SUPPLIER_INDUSTRIES, industry) ? industry : "정기 식물관리";
  return { ...supplier, ...SUPPLIER_INDUSTRIES[selection] };
}
