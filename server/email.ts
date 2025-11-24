import nodemailer from "nodemailer";
import type { Booking, B2bProposal } from "@shared/schema";

// Create transporter
const createTransporter = () => {
  // For development, use ethereal email (test account)
  // In production, configure with real SMTP credentials
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Fallback: console logging in development
  return null;
};

const transporter = createTransporter();

// Email templates
const bookingConfirmationTemplate = (booking: Booking) => {
  return {
    subject: `[simda] 상담 예약 확인 - ${booking.name}님`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Pretendard', -apple-system, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { margin: 10px 0; }
            .label { font-weight: 600; color: #16a34a; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🌿 simda</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">상담 예약이 접수되었습니다</p>
            </div>
            <div class="content">
              <h2 style="color: #16a34a; margin-top: 0;">안녕하세요, ${booking.name}님!</h2>
              <p>simda에 상담을 요청해 주셔서 감사합니다. 예약하신 내용을 확인해 주세요.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">예약번호:</span> ${booking.id}
                </div>
                <div class="info-row">
                  <span class="label">상담 유형:</span> ${booking.consultationType}
                </div>
                <div class="info-row">
                  <span class="label">희망 날짜:</span> ${new Date(booking.preferredDate).toLocaleDateString('ko-KR')}
                </div>
                <div class="info-row">
                  <span class="label">희망 시간:</span> ${booking.preferredTime}
                </div>
                <div class="info-row">
                  <span class="label">연락처:</span> ${booking.phone}
                </div>
              </div>

              ${booking.message ? `
                <div style="margin: 20px 0;">
                  <p class="label">문의 내용:</p>
                  <p style="background: #f9fafb; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${booking.message}</p>
                </div>
              ` : ''}

              <p style="margin-top: 30px;">
                담당자가 확인 후 24시간 이내에 연락드리겠습니다.<br>
                급하신 경우 고객센터(1588-0000)로 문의해 주세요.
              </p>
            </div>
            <div class="footer">
              <p><strong>simda</strong> - 식물과 함께하는 더 나은 공간</p>
              <p>이메일: contact@simda.kr | 전화: 1588-0000</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
안녕하세요, ${booking.name}님!

simda에 상담을 요청해 주셔서 감사합니다.

[예약 정보]
- 예약번호: ${booking.id}
- 상담 유형: ${booking.consultationType}
- 희망 날짜: ${new Date(booking.preferredDate).toLocaleDateString('ko-KR')}
- 희망 시간: ${booking.preferredTime}
- 연락처: ${booking.phone}

${booking.message ? `[문의 내용]\n${booking.message}\n` : ''}

담당자가 확인 후 24시간 이내에 연락드리겠습니다.
급하신 경우 고객센터(1588-0000)로 문의해 주세요.

---
simda - 식물과 함께하는 더 나은 공간
이메일: contact@simda.kr | 전화: 1588-0000
    `,
  };
};

const b2bProposalNotificationTemplate = (proposal: B2bProposal) => {
  return {
    subject: `[simda] B2B 협업 제안 접수 - ${proposal.companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Pretendard', -apple-system, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { margin: 10px 0; }
            .label { font-weight: 600; color: #16a34a; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🌿 simda</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">B2B 협업 제안이 접수되었습니다</p>
            </div>
            <div class="content">
              <h2 style="color: #16a34a; margin-top: 0;">안녕하세요, ${proposal.contactName}님!</h2>
              <p>simda에 협업 제안을 보내주셔서 감사합니다. 제안하신 내용을 확인해 주세요.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">제안번호:</span> ${proposal.id}
                </div>
                <div class="info-row">
                  <span class="label">회사명:</span> ${proposal.companyName}
                </div>
                <div class="info-row">
                  <span class="label">담당자:</span> ${proposal.contactName}
                </div>
                ${proposal.businessField ? `
                <div class="info-row">
                  <span class="label">사업 분야:</span> ${proposal.businessField}
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">연락처:</span> ${proposal.phone}
                </div>
                <div class="info-row">
                  <span class="label">이메일:</span> ${proposal.email}
                </div>
              </div>

              <div style="margin: 20px 0;">
                <p class="label">제안 내용:</p>
                <p style="background: #f9fafb; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${proposal.proposalContent}</p>
              </div>

              <p style="margin-top: 30px;">
                담당 부서에서 검토 후 영업일 기준 3-5일 이내에 연락드리겠습니다.<br>
                급하신 경우 B2B 전용 라인(02-1234-5678)으로 문의해 주세요.
              </p>
            </div>
            <div class="footer">
              <p><strong>simda</strong> - 식물과 함께하는 더 나은 공간</p>
              <p>B2B 문의: b2b@simda.kr | 전화: 02-1234-5678</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
안녕하세요, ${proposal.contactName}님!

simda에 협업 제안을 보내주셔서 감사합니다.

[제안 정보]
- 제안번호: ${proposal.id}
- 회사명: ${proposal.companyName}
- 담당자: ${proposal.contactName}
${proposal.businessField ? `- 사업 분야: ${proposal.businessField}\n` : ''}- 연락처: ${proposal.phone}
- 이메일: ${proposal.email}

[제안 내용]
${proposal.proposalContent}

담당 부서에서 검토 후 영업일 기준 3-5일 이내에 연락드리겠습니다.
급하신 경우 B2B 전용 라인(02-1234-5678)으로 문의해 주세요.

---
simda - 식물과 함께하는 더 나은 공간
B2B 문의: b2b@simda.kr | 전화: 02-1234-5678
    `,
  };
};

// Send booking confirmation email
export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  if (!transporter) {
    console.log("📧 Email would be sent (SMTP not configured):");
    console.log(`To: ${booking.email}`);
    console.log(`Subject: [simda] 상담 예약 확인 - ${booking.name}님`);
    return;
  }

  try {
    const template = bookingConfirmationTemplate(booking);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"simda" <noreply@simda.kr>',
      to: booking.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    console.log(`✅ Booking confirmation sent to ${booking.email}`);
  } catch (error) {
    console.error("❌ Failed to send booking confirmation:", error);
  }
}

// Send B2B proposal notification email
export async function sendB2BProposalNotification(proposal: B2bProposal): Promise<void> {
  if (!transporter) {
    console.log("📧 Email would be sent (SMTP not configured):");
    console.log(`To: ${proposal.email}`);
    console.log(`Subject: [simda] B2B 협업 제안 접수 - ${proposal.companyName}`);
    return;
  }

  try {
    const template = b2bProposalNotificationTemplate(proposal);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"simda" <noreply@simda.kr>',
      to: proposal.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    console.log(`✅ B2B proposal notification sent to ${proposal.email}`);
  } catch (error) {
    console.error("❌ Failed to send B2B proposal notification:", error);
  }
}
