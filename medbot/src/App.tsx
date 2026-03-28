import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import Auth from "./components/Auth";
import { v4 as uuid } from "uuid";
import {
  MedicalBot,
  AVAILABLE_MODELS,
  detectEmergency,
  EmergencyLevel,
} from "./lib/medicalBot";
import {
  Conversation,
  Message,
  saveConversation,
  loadConversation,
  getAllConversations,
  deleteConversation,
  searchConversations,
} from "./lib/storage";
import ModelLoader from "./components/ModelLoader";
import WarningBanner from "./components/WarningBanner";
import ChatWindow, { ChatMessage } from "./components/ChatWindow";
import HistoryPanel from "./components/HistoryPanel";
import {
  Menu,
  Heart,
  Plus,
  ChevronDown,
  AlertCircle,
  Phone,
} from "lucide-react";

type AppView = "loader" | "chat";

const bot = new MedicalBot();

const App: React.FC = () => {
  // Model loading state
  const [view, setView] = useState<AppView>("loader");
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelComplete, setIsModelComplete] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentEmergency, setCurrentEmergency] =
    useState<EmergencyLevel>(null);

  // Conversation state
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // UI state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Emergency fab
  const [showEmergencyFab, setShowEmergencyFab] = useState(false);

  // Refs
  const conversationRef = useRef<{
    id: string;
    model: string;
    createdAt: Date;
  } | null>(null);

  // Auth and load conversations on mount
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    loadAllConversations();
    
    // Environment diagnostics
    const hasWebGPU = !!(navigator as any).gpu;
    const hasSAB = typeof SharedArrayBuffer !== 'undefined';
    const isSecureContext = window.isSecureContext;
    
    console.log("[MedBot] Environment check:");
    console.log("- WebGPU:", hasWebGPU ? "✅" : "❌");
    console.log("- SharedArrayBuffer:", hasSAB ? "✅" : "❌ (Check COOP/COEP headers)");
    console.log("- Secure Context:", isSecureContext ? "✅" : "❌ (localhost/HTTPS required)");
    
    if (!hasWebGPU || !hasSAB) {
      setLoadingText(`⚠️ Alerte Environnement: ${!hasWebGPU ? "WebGPU absent. " : ""}${!hasSAB ? "SharedArrayBuffer absent (vérifiez les en-têtes)." : ""}`);
    }

    return () => subscription.unsubscribe();
  }, []);

  const loadAllConversations = async () => {
    const convs = await getAllConversations();
    setConversations(convs);
  };

  // Handle model loading
  const handleStartLoading = async () => {
    setIsModelLoading(true);
    setLoadingProgress(0);
    setLoadingText("Initialisation...");

    try {
      await bot.initialize(selectedModel, (progress) => {
        const text = progress.text;
        setLoadingText(text);
        
        // Priority: numeric progress field (0-1)
        if (typeof progress.progress === 'number') {
          setLoadingProgress(Math.round(progress.progress * 100));
        } else {
          // Fallback: parse percentage from text
          const percentMatch = text.match(/(\d+)%/);
          if (percentMatch) {
            setLoadingProgress(parseInt(percentMatch[1]));
          } else if (text.includes("Finish")) {
            setLoadingProgress(100);
          }
        }
      });
      setIsModelComplete(true);
      setLoadingProgress(100);
    } catch (err) {
      console.error("Failed to load model:", err);
      let errorMessage = "Échec du chargement du modèle.";
      
      if (err instanceof Error && (err.name === 'QuotaExceededError' || err.message.includes('Quota'))) {
        errorMessage = "⚠️ Espace disque insuffisant dans le navigateur. Veuillez libérer de l'espace sur votre disque C: ou évitez d'utiliser le mode Navigation Privée.";
      } else {
        errorMessage = `Erreur: ${err instanceof Error ? err.message : "Échec du chargement"}`;
      }
      
      setLoadingText(errorMessage);
      setIsModelLoading(false);
    }
  };

  const handleModelReady = () => {
    setView("chat");
    startNewConversation();
  };

  // Conversation management
  const startNewConversation = () => {
    const convId = uuid();
    conversationRef.current = {
      id: convId,
      model: selectedModel,
      createdAt: new Date(),
    };
    setCurrentConversationId(convId);
    setMessages([]);
    setCurrentEmergency(null);
  };

  const handleSelectConversation = async (id: string) => {
    const conv = await loadConversation(id);
    if (conv) {
      setCurrentConversationId(id);
      conversationRef.current = {
        id: conv.id,
        model: conv.model,
        createdAt: conv.createdAt,
      };
      setMessages(
        conv.messages.map((m) => ({
          ...m,
          isStreaming: false,
        }))
      );
    }
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    if (currentConversationId === id) {
      startNewConversation();
    }
    await loadAllConversations();
  };

  const handleSearchConversations = async (keyword: string) => {
    if (!keyword.trim()) {
      await loadAllConversations();
    } else {
      const results = await searchConversations(keyword);
      setConversations(results);
    }
  };

  // Save current conversation
  const saveCurrentConversation = useCallback(
    async (msgs: ChatMessage[]) => {
      if (!conversationRef.current || msgs.length === 0) return;

      const firstUserMsg = msgs.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 40) +
          (firstUserMsg.content.length > 40 ? "..." : "")
        : "Nouvelle conversation";

      const conversation: Conversation = {
        id: conversationRef.current.id,
        title,
        messages: msgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          emergencyLevel: m.emergencyLevel,
        })),
        model: conversationRef.current.model,
        createdAt: conversationRef.current.createdAt,
        updatedAt: new Date(),
      };

      await saveConversation(conversation);
      await loadAllConversations();
    },
    []
  );

  // Handle sending a message
  const handleSend = async (text: string) => {
    if (!bot.isReady() || isStreaming) return;

    // Check emergency
    const emergency = detectEmergency(text);
    if (emergency) {
      setCurrentEmergency(emergency);
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content: text,
      timestamp: new Date(),
      emergencyLevel: emergency,
    };

    const assistantMsgId = uuid();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    const updatedMsgs = [...messages, userMsg, assistantMsg];
    setMessages(updatedMsgs);
    setIsStreaming(true);

    // Build history for the model (no streaming markers)
    const history = messages
      .filter((m) => !m.isStreaming && m.content)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    try {
      const stream = bot.askStream(text, history);
      let fullContent = "";

      for await (const token of stream) {
        fullContent += token;
        const captured = fullContent;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: captured } : m
          )
        );
      }

      // Finalize
      const finalContent = fullContent;
      setMessages((prev) => {
        const final = prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: finalContent, isStreaming: false }
            : m
        );
        // Save after finalization
        saveCurrentConversation(final);
        return final;
      });
    } catch (err) {
      console.error("Stream error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  "Désolé, une erreur s'est produite. Veuillez réessayer.",
                isStreaming: false,
              }
            : m
        )
      );
    }

    setIsStreaming(false);
  };

  // Dismiss emergency
  const handleDismissEmergency = () => {
    setCurrentEmergency(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-sky-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/20">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-400 font-medium animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (view === "loader") {
    return (
      <ModelLoader
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onStartLoading={handleStartLoading}
        onModelReady={handleModelReady}
        progress={loadingProgress}
        progressText={loadingText}
        isLoading={isModelLoading}
        isComplete={isModelComplete}
      />
    );
  }

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="h-screen flex flex-col bg-bg-light overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-blue to-cyan-400 flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-text-dark">
              Med<span className="text-medical-blue">Bot</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model indicator */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-medical-green" />
              {currentModel?.name.split(" (")[0] || "Model"}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showModelDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowModelDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-20 p-1">
                  {AVAILABLE_MODELS.map((model) => (
                    <div
                      key={model.id}
                      className={`px-3 py-2 rounded-lg text-xs ${
                        model.id === selectedModel
                          ? "bg-sky-50 text-medical-blue font-medium"
                          : "text-slate-600"
                      }`}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-slate-400 text-[10px]">
                        {model.size} — {model.description}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* New conversation */}
          <button
            onClick={startNewConversation}
            className="p-2 rounded-lg bg-medical-blue text-white hover:bg-sky-600 transition-colors shadow-sm"
            title="Nouvelle conversation"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-red-600 transition-all border border-slate-200/50"
            title="Se déconnecter"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Warning banner */}
      <WarningBanner />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* History panel */}
        <HistoryPanel
          conversations={conversations}
          activeConversationId={currentConversationId}
          onSelect={handleSelectConversation}
          onNew={() => {
            startNewConversation();
            setHistoryOpen(false);
          }}
          onDelete={handleDeleteConversation}
          onSearch={handleSearchConversations}
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />

        {/* Chat window */}
        <ChatWindow
          messages={messages}
          onSend={handleSend}
          isModelReady={bot.isReady()}
          isStreaming={isStreaming}
          emergencyLevel={currentEmergency}
          onDismissEmergency={handleDismissEmergency}
        />
      </div>

      {/* Emergency FAB */}
      <div className="fixed bottom-24 right-6 z-30">
        <button
          onClick={() => setShowEmergencyFab(!showEmergencyFab)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          title="Numéros d'urgence"
        >
          <AlertCircle className="w-6 h-6" />
        </button>
        {showEmergencyFab && (
          <>
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setShowEmergencyFab(false)}
            />
            <div className="absolute bottom-14 right-0 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-3 space-y-2 animate-fade-in">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                🚨 Numéros d'urgence
              </p>
              <a
                href="tel:15"
                className="flex items-center gap-2 p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                SAMU — 15
              </a>
              <a
                href="tel:18"
                className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                Pompiers — 18
              </a>
              <a
                href="tel:112"
                className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                Urgences EU — 112
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
