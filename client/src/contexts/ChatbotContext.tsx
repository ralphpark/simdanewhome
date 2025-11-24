import { createContext, useContext, useState, ReactNode } from "react";

interface ChatbotContextType {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        openChatbot: () => setIsOpen(true),
        closeChatbot: () => setIsOpen(false),
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
}
