import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, ExternalLink, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AICuration() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "안녕하세요! simda의 AI 식물 큐레이터입니다. 당신의 공간에 완벽한 식물을 찾아드리겠습니다. 먼저 거주 환경에 대해 알려주세요. 실내인가요, 실외인가요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [showActions, setShowActions] = useState(false);
  const [recommendationText, setRecommendationText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollViewportRef.current) {
      // setTimeout으로 렌더링 완료 후 스크롤
      setTimeout(() => {
        if (scrollViewportRef.current) {
          scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    // 메시지 추가 전에 입력값 비우기
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.innerHTML = "";
    }
    
    const newUserMessage = { role: "user" as const, content: userMessage };
    const loadingPlaceholder = { role: "assistant" as const, content: "" };

    setMessages((prev) => [...prev, newUserMessage, loadingPlaceholder]);
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/chat", {
        message: userMessage,
        sessionId,
        history: [...messages, newUserMessage],
      });

      const response = await res.json();
      const aiReply = response.reply || "죄송합니다. 응답을 생성할 수 없습니다.";

      setMessages((prev) => {
        const withoutPlaceholder = prev.slice(0, -1);
        return [...withoutPlaceholder, { role: "assistant", content: aiReply }];
      });

      // Check if AI has completed recommendations with completion marker
      // Only show buttons when recommendation is fully complete
      if (aiReply.includes("[추천완료]")) {
        setRecommendationText(aiReply);
        setShowActions(true);
      }
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1));
      toast({
        title: "오류",
        description: "AI 응답을 받는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              ← 돌아가기
            </Button>
          </Link>
          <p className="text-muted-foreground">
            simda의 AI 식물 큐레이터와 대화하며 당신에게 완벽한 식물을 찾아보세요
          </p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>AI 식물 큐레이터와 대화</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <div ref={scrollViewportRef} className="h-full overflow-y-auto px-4">
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    data-testid={
                      message.role === "user" ? "message-user" : "message-ai"
                    }
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent/30 text-foreground border border-primary/20"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-accent/30 text-foreground rounded-lg px-4 py-3 flex items-center gap-2 border border-primary/20">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">응답 생성 중...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t p-4 flex-col gap-4">
            {/* Action Buttons */}
            {showActions && (
              <div className="w-full flex gap-2 flex-wrap">
                <Link href={`/booking?recommendation=${encodeURIComponent(recommendationText)}`}>
                  <Button
                    data-testid="button-booking-action"
                    variant="default"
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    상담 예약하기
                  </Button>
                </Link>
                <a
                  href="https://simgo.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    data-testid="button-shop-action"
                    variant="outline"
                    className="gap-2"
                  >
                    온라인샵에서 구매하기
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="https://simda.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    data-testid="button-marketplace-action"
                    variant="outline"
                    className="gap-2"
                  >
                    마켓플레이스 보기
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Textarea
                ref={textareaRef}
                key={`textarea-${messages.length}`}
                value={input}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInput(newValue);
                }}
                placeholder="메시지를 입력하세요..."
                data-testid="input-chat-message"
                className="resize-none min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                data-testid="button-send-message"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 h-[60px]"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">전송</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
