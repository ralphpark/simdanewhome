// Using user's own Gemini API key with @google/genai
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithAI(userMessage: string, history: Message[] = []): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "AI 서비스가 현재 사용 불가능합니다. GEMINI_API_KEY 환경 변수를 확인해주세요.";
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const systemPrompt = `당신은 "심다(SIMDA)"의 AI 식물 큐레이터입니다. 다음 순서로 대화를 진행하세요:
1. 사용자의 거주 환경 파악 (실내/실외, 햇빛 양, 습도, 공간 크기)
2. 식물 관리 경험 수준 확인 (초보/중급/고급)
3. 선호하는 식물 스타일 (관엽/다육/허브/꽃/공기정화 식물)
4. 특별한 요구사항 (반려동물 유무, 알레르기, 인테리어 스타일)
5. 최종 추천: 3가지 식물 (이름, 특징, 관리 방법, 추천 이유, 구매처)

구매처 안내:
* 온라인샵: https://simgo.kr/ (전국 배송)
* 지역 기반 샵: https://simda.me/ (직거래 가능)

친절하고 전문적으로 답변하며, 각 질문은 하나씩만 하세요.`;

    // Build contents array with system prompt and history
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ];

    // Add conversation history (skip initial AI greeting)
    for (const msg of history) {
      if (msg.role === "user") {
        contents.push({
          role: "user",
          parts: [{ text: msg.content }],
        });
      } else if (msg.role === "assistant" && contents.length > 1) {
        // Only add assistant messages if there are already user messages
        contents.push({
          role: "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents,
    });

    return response.text || "죄송합니다. 응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "AI 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
  }
}
