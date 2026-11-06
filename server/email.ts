import nodemailer from "nodemailer";
import type { Booking, B2bProposal } from "@shared/schema";

// Keep in sync with client/src/content/copy.ts footer (no client-side import).
const CONTACT_PHONE = "1551-0525";
const CONTACT_EMAIL = "simda@simda.kr";
const CONTACT_HOURS = "평일 09:00–18:00";
const BRAND_COLOR = "#03473E";
const ADMIN_URL = "https://simda.kr/admin";

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || "587");
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE !== undefined
        ? process.env.SMTP_SECURE === "true"
        : port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });
  }
  return null;
};

const transporter = createTransporter();

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

function confirmationName(value: string): string {
  const characters = Array.from(value);
  return characters.length > 40 ? `${characters.slice(0, 40).join("")}…` : value;
}

function notifyRecipients(): string[] {
  const recipients = (process.env.NOTIFY_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  return recipients.length ? recipients : [CONTACT_EMAIL];
}

function receivedAt(date: Date): string {
  return new Date(date).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "long",
    timeStyle: "medium",
  }) + " (한국 시간)";
}

type EmailRow = [label: string, value: string | null];
type EmailTemplate = {
  to: string | string[];
  replyTo: string;
  subject: string;
  html: string;
  text: string;
};

function bookingRows(booking: Booking): EmailRow[] {
  return [
    ["예약번호", booking.id],
    ["이름", booking.name],
    ["연락처", booking.phone],
    ["이메일", booking.email],
    ["상담 유형", booking.consultationType],
    ["희망 날짜", new Date(booking.preferredDate).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })],
    ["희망 시간", booking.preferredTime],
    ["문의 내용", booking.message],
    ["AI 추천 내용", booking.aiRecommendation],
    ["접수 시각", receivedAt(booking.createdAt)],
  ];
}

function proposalRows(proposal: B2bProposal): EmailRow[] {
  return [
    ["제안번호", proposal.id],
    ["회사명", proposal.companyName],
    ["담당자", proposal.contactName],
    ["연락처", proposal.phone],
    ["이메일", proposal.email],
    ["사업 분야", proposal.businessField],
    ["제안 내용", proposal.proposalContent],
    ["첨부 URL", proposal.attachmentUrl],
    ["접수 시각", receivedAt(proposal.createdAt)],
  ];
}

function emailTemplate(
  to: string | string[],
  replyTo: string,
  subject: string,
  introduction: string,
  rows: EmailRow[],
  internal = false,
): EmailTemplate {
  const title = subject.replace(/[\r\n\u2028\u2029]/g, "");
  const contact = `이메일: ${CONTACT_EMAIL} | 전화: ${CONTACT_PHONE} | 상담 시간: ${CONTACT_HOURS}`;

  return {
    to,
    replyTo,
    subject: title,
    html: `<!DOCTYPE html>
<html lang="ko">
  <head><meta charset="UTF-8"><title>${escapeHtml(title)}</title></head>
  <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
      <h1 style="background: ${BRAND_COLOR}; color: #fff; padding: 20px;">심다</h1>
      <h2 style="color: ${BRAND_COLOR};">${escapeHtml(title)}</h2>
      <p style="white-space: pre-wrap;">${escapeHtml(introduction)}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>${rows.map(([label, value]) => `
          <tr>
            <th scope="row" style="border: 1px solid #ddd; padding: 10px; text-align: left; vertical-align: top; color: ${BRAND_COLOR};">${escapeHtml(label)}</th>
            <td style="border: 1px solid #ddd; padding: 10px; white-space: pre-wrap; overflow-wrap: anywhere;">${escapeHtml(value ?? "미입력")}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      ${internal ? `<p><a href="${ADMIN_URL}" style="color: ${BRAND_COLOR};">관리자 화면에서 확인하기</a></p>` : ""}
      <p style="color: #666;">${contact}</p>
    </div>
  </body>
</html>`,
    text: `${title}\n\n${introduction}\n\n${rows.map(([label, value]) => `${label}: ${value ?? "미입력"}`).join("\n")}\n${internal ? `\n관리자 화면: ${ADMIN_URL}\n` : ""}\n심다\n${contact}`,
  };
}

export function bookingConfirmationTemplate(booking: Booking): EmailTemplate {
  const name = confirmationName(booking.name);
  return emailTemplate(
    booking.email,
    CONTACT_EMAIL,
    `[심다] 상담 예약 접수 — ${name}`,
    `안녕하세요, ${name}님.\n심다에 상담을 요청해 주셔서 감사합니다. 담당자가 확인한 뒤 연락드리겠습니다.`,
    bookingRows({ ...booking, name }).filter(([label]) =>
      ["예약번호", "이름", "상담 유형", "희망 날짜", "희망 시간", "접수 시각"].includes(label),
    ),
  );
}

export function bookingNotificationTemplate(booking: Booking): EmailTemplate {
  return emailTemplate(
    notifyRecipients(),
    booking.email,
    `[심다] 새 상담 예약 — ${booking.name}`,
    "새 상담 예약이 접수되었습니다.",
    bookingRows(booking),
    true,
  );
}

export function b2bProposalConfirmationTemplate(proposal: B2bProposal): EmailTemplate {
  const companyName = confirmationName(proposal.companyName);
  const contactName = confirmationName(proposal.contactName);
  return emailTemplate(
    proposal.email,
    CONTACT_EMAIL,
    `[심다] 협업 제안 접수 — ${companyName}`,
    `안녕하세요, ${contactName}님.\n심다에 협업 제안을 보내주셔서 감사합니다. 담당자가 확인한 뒤 연락드리겠습니다.`,
    proposalRows({ ...proposal, companyName, contactName }).filter(([label]) =>
      ["제안번호", "회사명", "담당자", "접수 시각"].includes(label),
    ),
  );
}

export function b2bProposalNotificationTemplate(proposal: B2bProposal): EmailTemplate {
  return emailTemplate(
    notifyRecipients(),
    proposal.email,
    `[심다] 새 협업 제안 — ${proposal.companyName}`,
    "새 협업 제안이 접수되었습니다.",
    proposalRows(proposal),
    true,
  );
}

async function sendEmail(template: EmailTemplate): Promise<void> {
  if (!transporter) {
    console.log("Email skipped (SMTP not configured):", { to: template.to, subject: template.subject });
    return;
  }

  // Let the route log rejected sends after both email attempts have settled.
  await transporter.sendMail({
    ...template,
    from: process.env.SMTP_FROM || `"심다" <${process.env.SMTP_USER}>`,
  });
}

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  await sendEmail(bookingConfirmationTemplate(booking));
}

export async function sendBookingNotification(booking: Booking): Promise<void> {
  await sendEmail(bookingNotificationTemplate(booking));
}

export async function sendB2BProposalConfirmation(proposal: B2bProposal): Promise<void> {
  await sendEmail(b2bProposalConfirmationTemplate(proposal));
}

export async function sendB2BProposalNotification(proposal: B2bProposal): Promise<void> {
  await sendEmail(b2bProposalNotificationTemplate(proposal));
}
