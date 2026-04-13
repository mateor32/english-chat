import { Bot } from "lucide-react";

const TypingIndicator = () => (
  <div className="flex gap-3 animate-fade-in-up">
    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary">
      <Bot className="w-4 h-4 text-primary" />
    </div>
    <div className="bg-chat-ai px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
      <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
    </div>
  </div>
);

export default TypingIndicator;
