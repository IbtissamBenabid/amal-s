import React from "react";
import { EmergencyLevel } from "../lib/medicalBot";
import { AlertTriangle, Phone, X, ShieldAlert, Clock } from "lucide-react";

interface EmergencyAlertProps {
  level: EmergencyLevel;
  onDismiss: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ level, onDismiss }) => {
  if (!level) return null;

  if (level === "absolute") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden">
          {/* Red header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 text-center">
            <ShieldAlert className="w-14 h-14 text-white mx-auto mb-3 animate-bounce-subtle" />
            <h2 className="text-2xl font-bold text-white">
              🚨 URGENCE DÉTECTÉE
            </h2>
          </div>

          <div className="p-6 text-center">
            <p className="text-slate-700 mb-5 text-sm leading-relaxed">
              Votre message semble décrire une <strong>urgence médicale</strong>.
              Un professionnel de santé doit intervenir immédiatement.
            </p>

            {/* Call button */}
            <a
              href="tel:15"
              className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 mb-4"
            >
              <Phone className="w-6 h-6" />
              APPELEZ LE 15 MAINTENANT
            </a>

            <div className="flex gap-3 mb-5">
              <a
                href="tel:18"
                className="flex-1 py-2.5 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 transition-colors text-sm"
              >
                Pompiers — 18
              </a>
              <a
                href="tel:112"
                className="flex-1 py-2.5 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Urgences EU — 112
              </a>
            </div>

            <button
              onClick={onDismiss}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
            >
              J'ai compris, continuer quand même
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (level === "urgent") {
    return (
      <div className="mx-4 mt-2 animate-fade-in">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-warning-amber shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-800 mb-1">
              ⚠️ Consultez un médecin aujourd'hui
            </p>
            <p className="text-xs text-orange-700">
              Vos symptômes nécessitent possiblement une consultation médicale
              rapide. Contactez votre médecin ou le 15 en cas d'aggravation.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // soon
  return (
    <div className="mx-4 mt-2 animate-fade-in">
      <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
        <Clock className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-yellow-800">
            <strong>💡 Conseil:</strong> Ces symptômes méritent une consultation médicale
            prochainement si ils persistent.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default EmergencyAlert;
