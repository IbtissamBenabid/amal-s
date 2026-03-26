# MedBot — Assistant Médical IA Local 🏥

MedBot est un assistant médical basé sur l'intelligence artificielle qui fonctionne **100% localement** dans votre navigateur. Aucune donnée ne quitte votre appareil.

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir dans Chrome/Edge
# http://localhost:5173
```

## 🔧 Configuration Requise

| Élément | Minimum | Recommandé |
|---------|---------|------------|
| **Navigateur** | Chrome 113+ / Edge 113+ | Dernière version |
| **RAM** | 4 GB | 8 GB+ |
| **GPU** | WebGPU supporté | GPU dédié |
| **Stockage** | 2 GB libre | 5 GB+ |

> ⚠️ **WebGPU doit être activé** dans votre navigateur. Firefox et Safari ne sont pas encore supportés.

## 📦 Modèles Disponibles

| Modèle | Taille | Description |
|--------|--------|-------------|
| **Phi-3.5 Mini** (recommandé) | ~2.2 GB | Meilleur équilibre performance/taille |
| **TinyLlama** | ~0.7 GB | Plus rapide, moins précis |
| **Gemma 2B** | ~1.4 GB | Bon équilibre |

Le modèle est téléchargé **une seule fois** puis mis en cache par le navigateur.

## 🏗️ Stack Technique

- **React 18** + TypeScript + Vite
- **@mlc-ai/web-llm** — Inférence IA locale via WebGPU
- **Tailwind CSS** — Styling
- **idb** — IndexedDB pour l'historique local
- **Lucide React** — Icônes

## ⚠️ Avertissement

MedBot est un **outil éducatif uniquement**. Il ne remplace en aucun cas un avis médical professionnel. En cas d'urgence, appelez le **15** (SAMU), le **18** (Pompiers) ou le **112** (Urgences européennes).

## 📄 Licence

MIT
