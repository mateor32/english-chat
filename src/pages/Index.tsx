import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ChatHeader, { type Language } from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME_MSGS: Record<Language, Msg> = {
  en: { role: "assistant", content: "Hi there! 👋 I'm your English practice partner. Let's have a conversation! How are you doing today?" },
  es: { role: "assistant", content: "¡Hola! 👋 Soy tu compañero de práctica de español. ¡Vamos a conversar! ¿Cómo estás hoy?" },
  pt: { role: "assistant", content: "Olá! 👋 Eu sou seu parceiro de prática de português. Vamos conversar! Como você está hoje?" },
};

const LANG_CODES: Record<Language, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
};

const Index = () => {
  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<Msg[]>([WELCOME_MSGS.en]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setMessages([WELCOME_MSGS[lang]]);
  };

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CODES[language];
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const sendMessage = async (text: string) => {
    const userMsg: Msg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: updated, language },
      });

      if (error) throw error;

      const reply = data?.reply;
      if (!reply) throw new Error("No response from AI");

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speak(reply);
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
      <ChatHeader language={language} onLanguageChange={handleLanguageChange} />
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>
      <ChatInput onSend={sendMessage} disabled={isLoading} language={language} />
    </div>
  );
};

export default Index;
