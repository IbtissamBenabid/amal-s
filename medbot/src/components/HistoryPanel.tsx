import React, { useState } from "react";
import { Conversation, exportConversation } from "../lib/storage";
import {
  Search,
  Trash2,
  Download,
  MessageSquare,
  Plus,
  X,
  ChevronLeft,
} from "lucide-react";

interface HistoryPanelProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onSearch: (keyword: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  conversations,
  activeConversationId,
  onSelect,
  onNew,
  onDelete,
  onSearch,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    onSearch(val);
  };

  const handleExport = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = exportConversation(conv);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medbot-${conv.title.slice(0, 30).replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`fixed lg:relative z-40 top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/60 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:hidden"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-text-dark">
              Historique
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={onNew}
                className="p-2 rounded-lg text-medical-blue hover:bg-sky-50 transition-colors"
                title="Nouvelle conversation"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors lg:hidden"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-blue/20 focus:border-medical-blue/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                {searchQuery
                  ? "Aucun résultat"
                  : "Aucune conversation"}
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  onSelect(conv.id);
                  onClose();
                }}
                className={`group flex items-start gap-2 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                  activeConversationId === conv.id
                    ? "bg-sky-50 border border-medical-blue/20"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <MessageSquare
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    activeConversationId === conv.id
                      ? "text-medical-blue"
                      : "text-slate-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      activeConversationId === conv.id
                        ? "text-medical-blue"
                        : "text-text-dark"
                    }`}
                  >
                    {conv.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatDate(conv.updatedAt)} •{" "}
                    {conv.messages.length} msg
                  </p>
                </div>
                {/* Actions */}
                <div className="shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleExport(conv, e)}
                    className="p-1 rounded text-slate-400 hover:text-medical-blue hover:bg-sky-50 transition-colors"
                    title="Exporter"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-emergency-red hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center">
            Données stockées localement
          </p>
        </div>
      </aside>
    </>
  );
};

export default HistoryPanel;
