import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled,
  isStreaming,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && !isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled, isStreaming]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setText("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200/60"
    >
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || isStreaming}
          placeholder={
            disabled
              ? "Chargement du modèle..."
              : isStreaming
              ? "MedBot est en train de répondre..."
              : "Décrivez vos symptômes ou posez une question santé..."
          }
          rows={1}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-blue/30 focus:border-medical-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ maxHeight: "120px" }}
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || disabled || isStreaming}
        className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-medical-blue to-cyan-500 text-white flex items-center justify-center shadow-md shadow-medical-blue/20 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
      >
        {isStreaming ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default MessageInput;
