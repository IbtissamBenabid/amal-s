import React from "react";
import { Heart, User } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  isStreaming,
  timestamp,
}) => {
  const isUser = role === "user";

  // Very simple markdown-ish rendering: bold, line breaks, bullets
  const renderContent = (text: string) => {
    if (!text && isStreaming) {
      return (
        <div className="flex items-center gap-1.5 py-1">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      );
    }

    // Split into lines and parse
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Replace **bold** with <strong>
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className={isUser ? "text-white" : "text-slate-800"}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={j}>{part}</span>;
      });

      // Empty lines become gaps
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }

      // Bullet lines
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return (
          <div key={i} className="flex gap-2 ml-2">
            <span className="shrink-0">•</span>
            <span>{rendered}</span>
          </div>
        );
      }

      // Numbered lines
      const numMatch = line.trim().match(/^(\d+)\.\s/);
      if (numMatch) {
        return (
          <div key={i} className="flex gap-2 ml-1">
            <span className="shrink-0 font-semibold">{numMatch[1]}.</span>
            <span>
              {parts
                .map((part, j) => {
                  const trimmedLine = line.trim();
                  const afterNumber = trimmedLine.substring(
                    trimmedLine.indexOf(". ") + 2
                  );
                  const afterParts = afterNumber.split(/(\*\*[^*]+\*\*)/g);
                  return afterParts.map((p, k) => {
                    if (p.startsWith("**") && p.endsWith("**")) {
                      return (
                        <strong
                          key={`${j}-${k}`}
                          className={isUser ? "text-white" : "text-slate-800"}
                        >
                          {p.slice(2, -2)}
                        </strong>
                      );
                    }
                    return <span key={`${j}-${k}`}>{p}</span>;
                  });
                })
                .flat()}
            </span>
          </div>
        );
      }

      return (
        <p key={i} className="leading-relaxed">
          {rendered}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} ${
        isUser ? "animate-slide-right" : "animate-slide-left"
      }`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-medical-blue to-cyan-400"
            : "bg-gradient-to-br from-emerald-400 to-medical-green"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Heart className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-medical-blue to-sky-500 text-white rounded-tr-md"
            : "bg-white border border-slate-100 text-slate-700 rounded-tl-md border-l-[3px] border-l-medical-blue"
        }`}
      >
        <div className={`text-sm message-content ${isUser ? "text-white" : ""}`}>
          {renderContent(content)}
          {isStreaming && content && (
            <span className="inline-block w-1.5 h-4 bg-medical-blue/60 ml-0.5 animate-pulse-slow rounded-sm" />
          )}
        </div>
        {timestamp && !isStreaming && (
          <p
            className={`text-[10px] mt-1.5 ${
              isUser ? "text-white/60" : "text-slate-400"
            }`}
          >
            {new Date(timestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
