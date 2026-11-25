export const BILLING_DATA_SOURCE_ID = "4220808e-1338-810a-85ea-000b1f4d7d4b";

export const BILL = {
  title: "청구",
  customer: "거래처",
  item: "품목",
  supplyCost: "공급가액",
  date: "계산서 발행일",
  requested: "발행 요청",
  status: "발행 상태",
  approval: "승인번호",
  error: "발행 오류",
  key: "볼타 발행키",
  reference: "발행 참조번호",
  industry: "계산서 업종",
  invoiced: "계산서 발행",
  number: "청구 번호",
} as const;

export const CUSTOMER = {
  title: "거래처명",
  company: "상호(법인명)",
  businessNumber: "사업자번호",
  representative: "대표자명",
  address: "주소",
  businessType: "업태",
  businessItem: "종목",
  email: "계산서 이메일",
} as const;

export const STATUS = {
  ready: "미요청",
  pending: "발행 중",
  complete: "발행 완료",
  failed: "실패",
} as const;
