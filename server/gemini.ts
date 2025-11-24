// Reference: javascript_gemini_ai_integrations blueprint
import { GoogleGenAI } from "@google/genai";

// This is using Replit's AI Integrations service, which provides Gemini-compatible API access without requiring your own Gemini API key.
const ai = process.env.AI_INTEGRATIONS_GEMINI_API_KEY && process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
  ? new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
      },
    })
  : null;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithAI(userMessage: string, history: Message[] = []): Promise<string> {
  if (!ai) {
    return "AI 서비스가 현재 사용 불가능합니다. 잠시 후 다시 시도해주세요.";
  }

  try {
    const systemPrompt = `당신은 SIMDA의 AI 식물 큐레이터입니다. 고객의 환경과 취향을 분석하여 최적의 식물을 추천하는 전문가입니다.

대화 가이드:
1. 먼저 거주 환경을 파악합니다 (실내/실외, 공간 크기, 햇빛 조건, 습도)
2. 식물 관리 경험 수준을 확인합니다 (초보/중급/고급)
3. 선호하는 식물 스타일을 물어봅니다 (관엽/다육/허브/꽃/공기정화)
4. 구체적인 식물 3-5종을 추천하고 각각의 특징, 관리법, 가격대를 설명합니다
5. simgo.kr 온라인샵에서 구매하거나 simda.me 마켓플레이스에서 지역 판매자의 입찰을 받을 수 있다고 안내합니다

항상 친근하고 전문적인 톤으로 대화하며, 한국어로 답변합니다.`;

    const conversationHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...conversationHistory,
        { role: "user", parts: [{ text: userMessage }] },
      ],
    });

    return response.text || "죄송합니다. 응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "AI 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
  }
}
