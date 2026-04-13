import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  return (
    <div className="border-t border-border bg-chat-input-bg p-4">
      <div className="max-w-3xl mx-auto flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message in English..."
          rows={1}
          className="flex-1 resize-none bg-secondary text-foreground placeholder:text-muted-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 scrollbar-thin"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition-opacity disabled:opacity-30 hover:opacity-90"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
