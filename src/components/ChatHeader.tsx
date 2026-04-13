import { Bot, Sparkles } from "lucide-react";

const ChatHeader = () => (
  <div className="border-b border-border bg-chat-header px-6 py-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
      <Bot className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
        AI English Practice
        <Sparkles className="w-4 h-4 text-primary" />
      </h1>
      <p className="text-xs text-muted-foreground">Practice English through natural conversation</p>
    </div>
  </div>
);

export default ChatHeader;
