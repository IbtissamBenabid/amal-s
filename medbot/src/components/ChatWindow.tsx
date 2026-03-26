import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import EmergencyAlert from "./EmergencyAlert";
import { EmergencyLevel } from "../lib/medicalBot";
import { Heart, Sparkles } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  emergencyLevel?: EmergencyLevel;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isModelReady: boolean;
  isStreaming: boolean;
  emergencyLevel: EmergencyLevel;
  onDismissEmergency: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSend,
  isModelReady,
  isStreaming,
  emergencyLevel,
  onDismissEmergency,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center max-w-sm animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-50 mb-5">
                <Heart className="w-8 h-8 text-medical-blue" />
              </div>
              <h2 className="text-xl font-bold text-text-dark mb-2">
                Bienvenue sur MedBot
              </h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Posez-moi des questions sur la santé. Je vous fournirai des
                informations éducatives générales.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Quels sont les symptômes d'un rhume ?",
                  "Comment prévenir les maux de dos ?",
                  "Quand faut-il consulter un médecin ?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onSend(suggestion)}
                    disabled={!isModelReady}
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 hover:border-medical-blue/30 text-left text-sm text-slate-600 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 text-medical-blue shrink-0" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                {msg.emergencyLevel && msg.role === "user" && (
                  <EmergencyAlert
                    level={msg.emergencyLevel}
                    onDismiss={onDismissEmergency}
                  />
                )}
                <MessageBubble
                  role={msg.role}
                  content={msg.content}
                  isStreaming={msg.isStreaming}
                  timestamp={msg.timestamp}
                />
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Emergency overlay for absolute emergencies only on current message */}
      {emergencyLevel === "absolute" && (
        <EmergencyAlert level="absolute" onDismiss={onDismissEmergency} />
      )}

      {/* Input */}
      <MessageInput
        onSend={onSend}
        disabled={!isModelReady}
        isStreaming={isStreaming}
      />
    </div>
  );
};

export default ChatWindow;
