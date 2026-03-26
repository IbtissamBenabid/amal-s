import React from "react";
import { AlertTriangle, Phone } from "lucide-react";

const WarningBanner: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/60 text-xs">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-warning-amber shrink-0" />
        <span className="text-amber-800 font-medium">
          Outil éducatif uniquement — Ne remplace pas un avis médical
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <a
          href="tel:15"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-emergency-red/10 hover:bg-emergency-red/20 text-emergency-red font-bold transition-colors"
          title="SAMU"
        >
          <Phone className="w-3 h-3" />
          15
        </a>
        <a
          href="tel:18"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold transition-colors"
          title="Pompiers"
        >
          <Phone className="w-3 h-3" />
          18
        </a>
        <a
          href="tel:112"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold transition-colors"
          title="Urgences européennes"
        >
          <Phone className="w-3 h-3" />
          112
        </a>
      </div>
    </div>
  );
};

export default WarningBanner;
