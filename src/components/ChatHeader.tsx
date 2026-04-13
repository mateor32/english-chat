import { Bot, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Language = "en" | "es" | "pt";

const LANG_LABELS: Record<Language, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
};

interface ChatHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const ChatHeader = ({ language, onLanguageChange }: ChatHeaderProps) => (
  <div className="border-b border-border bg-chat-header px-6 py-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
      <Bot className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
        AI Language Practice
        <Sparkles className="w-4 h-4 text-primary" />
      </h1>
      <p className="text-xs text-muted-foreground">Practice through natural conversation</p>
    </div>
    <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
      <SelectTrigger className="w-[140px] h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(LANG_LABELS) as Language[]).map((k) => (
          <SelectItem key={k} value={k}>
            {LANG_LABELS[k]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default ChatHeader;
