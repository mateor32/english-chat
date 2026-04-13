import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content: "Hi there! 👋 I'm your English practice partner. Let's have a conversation! How are you doing today?",
};

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const userMsg: Msg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: updated },
      });

      if (error) throw error;

      const reply = data?.reply;
      if (!reply) throw new Error("No response from AI");

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      console.error("Chat error:", e);
      const status = e?.status || e?.context?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (status === 402) {
        toast.error("AI credits exhausted. Please add funds in workspace settings.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default Index;
