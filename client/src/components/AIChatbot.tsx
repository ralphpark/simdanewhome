import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChatbot() {
  const { isOpen, openChatbot, closeChatbot } = useChatbot();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "안녕하세요! simda의 AI 식물 큐레이터입니다. 당신의 공간에 완벽한 식물을 찾아드리겠습니다. 먼저 거주 환경에 대해 알려주세요. 실내인가요, 실외인가요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message and loading placeholder
    const newUserMessage = { role: "user" as const, content: userMessage };
    const loadingPlaceholder = { role: "assistant" as const, content: "" };
    
    setMessages((prev) => [...prev, newUserMessage, loadingPlaceholder]);
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/chat", {
        message: userMessage,
        sessionId,
        history: [...messages, newUserMessage], // Send full history including current message
      });

      const response = await res.json();

      // Ensure we have a non-empty reply
      const aiReply = response.reply || "죄송합니다. 응답을 생성할 수 없습니다.";

      // Replace loading placeholder with actual reply
      setMessages((prev) => {
        const withoutPlaceholder = prev.slice(0, -1);
        return [...withoutPlaceholder, { role: "assistant", content: aiReply }];
      });
    } catch (error) {
      // Remove loading placeholder on error
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

  if (!isOpen) {
    return (
      <Button
        size="icon"
        data-testid="button-open-chat"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={openChatbot}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">AI 상담 열기</span>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl z-50">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">AI 식물 큐레이터</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-close-chat"
          onClick={closeChatbot}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">닫기</span>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea ref={scrollRef} className="h-full px-4">
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                data-testid={message.role === "user" ? "message-user" : "message-ai"}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground border-l-4 border-primary-border"
                      : "bg-accent text-accent-foreground border-l-4 border-primary"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-accent text-accent-foreground rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">응답 생성 중...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            data-testid="input-chat-message"
            className="resize-none min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            data-testid="button-send-message"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">전송</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
