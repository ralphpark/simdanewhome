import { z } from "zod";
import { insertBookingSchema, insertB2bProposalSchema } from "@shared/schema";

export const phoneSchema = z.string().trim().regex(/^(?:0\d{1,2}[- ]?\d{3,4}[- ]?\d{4}|\+82[- ]?\d{1,2}[- ]?\d{3,4}[- ]?\d{4})$/, "연락 가능한 전화번호를 확인해 주세요. 예: 010-1234-5678");
export function isAvailableDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day > today && day.getDay() !== 0 && day.getDay() !== 6;
}
export const bookingSchema = insertBookingSchema.extend({
  name: z.string().trim().min(2, "이름을 두 글자 이상 입력해 주세요."),
  phone: phoneSchema,
  email: z.string().trim().email("이메일 주소를 확인해 주세요. 예: name@example.com"),
  consultationType: z.enum(["plant-care", "education", "landscape", "sales", "other"], { errorMap: () => ({ message: "상담 유형을 선택해 주세요." }) }),
  preferredDate: z.date({ required_error: "희망 날짜를 선택해 주세요.", invalid_type_error: "희망 날짜를 선택해 주세요." }).refine(isAvailableDate, "오늘 이후의 평일을 선택해 주세요."),
  preferredTime: z.string().regex(/^(10|11|12|13|14|15|16|17):00$/, "희망 시간을 선택해 주세요."),
  message: z.string().trim().max(5000, "메시지는 5,000자 이내로 작성해 주세요."),
});
export const proposalSchema = insertB2bProposalSchema.extend({
  companyName: z.string().trim().min(2, "회사명을 두 글자 이상 입력해 주세요."),
  contactName: z.string().trim().min(2, "담당자 이름을 두 글자 이상 입력해 주세요."),
  phone: phoneSchema,
  email: z.string().trim().email("이메일 주소를 확인해 주세요. 예: name@example.com"),
  businessField: z.string().trim().max(100, "사업 분야는 100자 이내로 입력해 주세요."),
  proposalContent: z.string().trim().min(20, "제안 내용을 20자 이상 적어 주세요. 공간, 일정, 원하시는 협업을 알려주시면 좋습니다.").max(10000, "제안 내용은 10,000자 이내로 작성해 주세요."),
});
export type BookingValues = z.infer<typeof bookingSchema>;
export type ProposalValues = z.infer<typeof proposalSchema>;

export { FloatingInput, FloatingTextarea, SuccessCheck } from "@/components/site/AppleFields";

export function requestError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.startsWith("429:")) return "요청이 잠시 몰리고 있습니다. 잠시 후 다시 보내 주세요. 입력하신 내용은 그대로 유지됩니다.";
  if (message.startsWith("400:")) return "입력 내용을 다시 확인해 주세요. 계속 접수되지 않으면 1551-0525로 연락해 주세요.";
  return "접수 여부를 확인하지 못했습니다. 인터넷 연결을 확인해 주세요. 다시 시도하기 전 1551-0525로 접수 여부를 문의하실 수 있습니다. 입력하신 내용은 그대로 유지됩니다.";
}
