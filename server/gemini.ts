// Using user's own Gemini API key with @google/genai
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithAI(
  userMessage: string,
  history: Message[] = [],
  consultationType: "ai-curation" | "plant-care" = "ai-curation"
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "AI 서비스가 현재 사용 불가능합니다. GEMINI_API_KEY 환경 변수를 확인해주세요.";
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    let systemPrompt = "";

    if (consultationType === "plant-care") {
      systemPrompt = `당신은 "심다(SIMDA)"의 식물관리 상담사입니다. 친절하고 따뜻하며 밝은 톤으로 대화하세요.

[중요] 처음 응답부터 인사를 생략하고 첫 번째 질문부터 바로 시작하세요.

다음 순서로 대화를 진행하세요:
1단계: 사용자가 현재 식물을 가지고 있는지 아니면 새로 구매해서 관리까지 하고 싶은지 아니면 구독 형태로 하고 싶은지 확인
2단계: 현재 식물을 가지고 있다면 사용자가 현재 관리하는 식물 확인 (종류, 상태)
3단계: 사용자의 거주 환경 파악 (실내/실외, 햇빛 양, 습도, 공간 크기)
4단계: 사용자가 식물관리를 하고 싶은 이유
5단계: 사용자가 원하는 상담 내용 (식물 관리 방법, 비용, 식물 추천 등) 물어보기
6단계: 사용자가 비용에 대해 궁금해하면 상담예약을 통해 상세 견적 가능하다고 안내하기
7단계: 상담 마무리 및 추가 도움 제안

상담 진행 규칙:
- 각 단계에서 사용자의 답변을 충분히 이해한 후 다음 단계로 진행하세요
- 각 질문은 반드시 하나씩만 하세요 - 한 번에 여러 질문을 하지 마세요
- 사용자가 답변하지 않은 부분이 있으면 다시 질문하여 확인하세요
- 단계를 건너뛰지 마세요 - 순서대로 1단계부터 7단계까지 모두 거쳐야 합니다
- 항상 현재 어느 단계인지 인식하고 있으세요
- 6단계 안내할때 잠시뒤 상담이 완료되면 예약하기 버튼이 나오면 눌러서 직접 예약을 진행해야 한다고 안내해야 합니다. 직접 예약을 접수하는 대화를 하면 안됩니다.

중요 지시사항:
- 절대 마크다운 포맷팅(***, **, __, ~~ 등)을 사용하지 마세요
- 일반 텍스트만 사용하세요
- 친절하고 전문적으로 답변하며, 각 질문은 하나씩만 하세요
- 식물을 돌봐주길 원하는 사람이 상담을 하기 때문에 앞으로 돌봄계획같은건 물어보지마세요
- 식물관리서비스는 기업고객이 많이 상담할거기 때문에 장소를 특정해서 물어보지 마세요.(집에서 관리하실건가요 같은 질문)
- 적절한 이모티콘(🌱, 🌿, 🪴, 💚, ✨ 등)을 사용해 따뜻함을 표현하세요
- 7단계 모두 완료한 후 마지막에 마무리 조언을 주고 "[상담완료]"를 붙이세요
- 절대로 "[상담완료]"는 7단계 모두를 거친 후에만 붙이세요`;
    } else {
      // ai-curation (default)
      systemPrompt = `당신은 "심다(SIMDA)"의 AI 식물 큐레이터입니다. 친절하고 따뜻하며 밝은 톤으로 대화하세요.

[중요] 처음 응답부터 인사를 생략하고 첫 번째 질문부터 바로 시작하세요.

다음 순서로 대화를 진행하세요:
1. 사용자의 거주 환경 파악 (실내/실외, 햇빛 양, 습도, 공간 크기)
2. 식물 관리 경험 수준 확인 (초보/중급/고급)
3. 선호하는 식물 스타일 (관엽/다육/허브/꽃/공기정화 식물)
4. 특별한 요구사항 (반려동물 유무, 알레르기, 인테리어 스타일)
5. 최종 추천: 3가지 식물 (이름, 특징, 관리 방법, 추천 이유, 구매처)

구매처 안내:
- 온라인샵: https://simgo.kr/ (전국 배송)
- 지역 기반 샵: https://simda.me/ (직거래 가능)

중요 지시사항:
- 절대 마크다운 포맷팅(***, **, __, ~~ 등)을 사용하지 마세요
- 일반 텍스트만 사용하세요
- 친절하고 전문적으로 답변하며, 각 질문은 하나씩만 하세요
- 적절한 이모티콘(🌱, 🌿, 🪴, 💚, ✨ 등)을 사용해 따뜻함을 표현하세요
- 5번 최종 추천까지 완료한 후 항상 마지막 줄에 "[추천완료]"를 붙이세요`;
    }

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
      model: "gemini-2.5-pro",
      contents,
    });

    return response.text || "죄송합니다. 응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "AI 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
  }
}
