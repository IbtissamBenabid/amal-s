import React from "react";
import { AVAILABLE_MODELS } from "../lib/medicalBot";
import { Shield, Cpu, Download, CheckCircle2, Loader2, Heart } from "lucide-react";

interface ModelLoaderProps {
  onModelReady: () => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onStartLoading: () => void;
  progress: number;
  progressText: string;
  isLoading: boolean;
  isComplete: boolean;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({
  onModelReady,
  selectedModel,
  onModelChange,
  onStartLoading,
  progress,
  progressText,
  isLoading,
  isComplete,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-medical-blue/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-medical-green/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-medical-blue to-cyan-400 shadow-lg shadow-medical-blue/25 mb-5">
            <Heart className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-text-dark mb-2">
            Med<span className="gradient-text">Bot</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Assistant Médical IA — 100% Local
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl shadow-xl shadow-slate-200/50 p-8">
          {!isLoading && !isComplete ? (
            <>
              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-text-dark mb-3">
                  Choisissez votre modèle IA
                </label>
                <div className="space-y-2">
                  {AVAILABLE_MODELS.map((model) => (
                    <label
                      key={model.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedModel === model.id
                          ? "border-medical-blue bg-sky-50/80 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={model.id}
                        checked={selectedModel === model.id}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedModel === model.id
                            ? "border-medical-blue"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedModel === model.id && (
                          <div className="w-2 h-2 rounded-full bg-medical-blue" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-text-dark">
                            {model.name}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {model.size}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {model.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Download info */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-6">
                <Download className="w-4 h-4 text-warning-amber mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  <strong>~2GB à télécharger</strong> (une seule fois). Le modèle
                  est mis en cache dans le navigateur après le premier
                  téléchargement.
                </p>
              </div>

              {/* Start button */}
              <button
                onClick={onStartLoading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-medical-blue to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-medical-blue/25 hover:shadow-xl hover:shadow-medical-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Charger le modèle
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Loading state */}
              <div className="text-center mb-6">
                {isComplete ? (
                  <CheckCircle2 className="w-12 h-12 text-medical-green mx-auto mb-3" />
                ) : (
                  <Loader2 className="w-12 h-12 text-medical-blue mx-auto mb-3 animate-spin" />
                )}
                <h2 className="text-lg font-semibold text-text-dark mb-1">
                  {isComplete
                    ? "Modèle prêt !"
                    : "Chargement du modèle IA local..."}
                </h2>
                <p className="text-sm text-slate-500 min-h-[2.5rem]">
                  {progressText || "Initialisation..."}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-500">
                    Progression
                  </span>
                  <span className="text-xs font-bold text-medical-blue">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out relative"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg, #0EA5E9, #06B6D4, #10B981)",
                    }}
                  >
                    {!isComplete && (
                      <div className="absolute inset-0 animate-shimmer" />
                    )}
                  </div>
                </div>
              </div>

              {isComplete && (
                <button
                  onClick={onModelReady}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-medical-green to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-medical-green/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-fade-in"
                >
                  Commencer la conversation
                </button>
              )}
            </>
          )}
        </div>

        {/* Privacy badge and clear storage */}
        <div className="flex flex-col items-center gap-3 mt-6 animate-fade-in">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200/60 shadow-sm">
            <Shield className="w-4 h-4 text-medical-green" />
            <span className="text-xs font-medium text-slate-600">
              🔒 Votre confidentialité est protégée — IA 100% locale
            </span>
          </div>
          
          <button
            onClick={async () => {
              if (confirm("Effacer tous les modèles téléchargés pour libérer de l'espace ?")) {
                const keys = await window.caches.keys();
                await Promise.all(keys.map(key => window.caches.delete(key)));
                window.location.reload();
              }
            }}
            className="text-[10px] text-slate-400 hover:text-medical-blue transition-colors underline underline-offset-2"
          >
            Nettoyer les modèles (libérer de l'espace)
          </button>
        </div>

        {/* Requirements note */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Nécessite Chrome 113+ ou Edge 113+ avec WebGPU • 4GB RAM minimum
        </p>
      </div>
    </div>
  );
};

export default ModelLoader;
