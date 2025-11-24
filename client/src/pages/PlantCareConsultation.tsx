import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function PlantCareConsultation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "안녕하세요! 🌿 simda의 식물관리 상담사입니다. 식물관리에 대해서 궁금하신가요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `plant-care-${Date.now()}-${Math.random()}`);
  const [showActions, setShowActions] = useState(false);
  const [consultationText, setConsultationText] = useState("");
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollViewportRef.current) {
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
        consultationType: "plant-care",
      });

      const response = await res.json();
      const aiReply = response.reply || "죄송합니다. 응답을 생성할 수 없습니다.";

      setMessages((prev) => {
        const withoutPlaceholder = prev.slice(0, -1);
        return [...withoutPlaceholder, { role: "assistant", content: aiReply }];
      });

      // Check if consultation is complete
      if (aiReply.includes("[상담완료]")) {
        setConsultationText(aiReply);
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            식물관리 상담
          </h1>
          <p className="text-muted-foreground">
            simda의 식물관리 상담사와 함께 현재 식물들의 관리 팁을 얻어보세요
          </p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>식물관리 상담사와 대화</CardTitle>
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
                <Link href={`/booking?recommendation=${encodeURIComponent(consultationText)}&type=plant-care`}>
                  <Button
                    data-testid="button-booking-action"
                    variant="default"
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    상담 예약하기
                  </Button>
                </Link>
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
