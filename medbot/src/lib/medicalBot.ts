import * as webllm from "@mlc-ai/web-llm";

const MEDICAL_SYSTEM_PROMPT = `Tu es MedBot, un assistant médical informatif.
Tu donnes UNIQUEMENT des informations générales sur la santé.
Tu ne poses JAMAIS de diagnostic.
Tu recommandes TOUJOURS de consulter un professionnel de santé.

Pour chaque réponse, structure ainsi:
1. **Information Générale**: Contenu éducatif sur le sujet
2. **Quand consulter un médecin**: Guidance claire
3. **Ce que le médecin pourrait faire**: Aperçu général
4. **⚠️ Rappel**: Ceci est une information générale, pas un diagnostic.

Réponds en français simple et clair. Sois empathique et rassurant.`;

export const AVAILABLE_MODELS = [
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi-3.5 Mini (Recommandé)",
    size: "~2.2GB",
    description: "Meilleur équilibre performance/taille",
  },
  {
    id: "Qwen2-0.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2 0.5B (Ultra-Léger)",
    size: "~280MB",
    description: "Pour connexions lentes ou peu d'espace",
  },
  {
    id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
    name: "TinyLlama (Rapide)",
    size: "~0.7GB",
    description: "Plus rapide, moins précis",
  },
];

export const EMERGENCY_KEYWORDS = {
  absolute: [
    "douleur poitrine",
    "chest pain",
    "essoufflement sévère",
    "hémorragie",
    "perte de conscience",
    "avc",
    "stroke",
    "crise cardiaque",
    "overdose",
    "je veux mourir",
    "suicide",
    "i want to die",
    "difficulty breathing",
  ],
  urgent: [
    "fièvre persistante",
    "vomissements répétés",
    "éruption cutanée soudaine",
    "douleur abdominale forte",
    "severe pain",
    "paralysie",
  ],
  soon: [
    "maux de tête fréquents",
    "fatigue chronique",
    "douleurs articulaires",
    "insomnie",
    "perte de poids",
  ],
};

export type EmergencyLevel = "absolute" | "urgent" | "soon" | null;

export const detectEmergency = (text: string): EmergencyLevel => {
  const lower = text.toLowerCase();
  if (EMERGENCY_KEYWORDS.absolute.some((k) => lower.includes(k)))
    return "absolute";
  if (EMERGENCY_KEYWORDS.urgent.some((k) => lower.includes(k)))
    return "urgent";
  if (EMERGENCY_KEYWORDS.soon.some((k) => lower.includes(k))) return "soon";
  return null;
};

export class MedicalBot {
  private engine: webllm.MLCEngine | null = null;
  private isLoading = false;

  async initialize(
    modelId: string = "Phi-3.5-mini-instruct-q4f16_1-MLC",
    onProgress?: (progress: webllm.InitProgressReport) => void
  ): Promise<void> {
    console.log(`[MedBot] Starting initialization for model: ${modelId}`);
    this.isLoading = true;
    try {
      console.log(`[MedBot] Calling webllm.CreateMLCEngine...`);
      this.engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (progress) => {
          console.log(`[MedBot] Progress: ${progress.text} (${Math.round((progress.progress || 0) * 100)}%)`);
          if (onProgress) onProgress(progress);
        },
      });
      console.log(`[MedBot] MLCEngine created successfully.`);
    } catch (err) {
      console.error(`[MedBot] Error during engine creation:`, err);
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async ask(
    question: string,
    history: { role: "user" | "assistant"; content: string }[]
  ): Promise<string> {
    if (!this.engine) throw new Error("Model not initialized");

    const messages: webllm.ChatCompletionMessageParam[] = [
      { role: "system", content: MEDICAL_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: question },
    ];

    const reply = await this.engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    return reply.choices[0]?.message?.content || "";
  }

  async *askStream(
    question: string,
    history: { role: "user" | "assistant"; content: string }[]
  ): AsyncGenerator<string> {
    if (!this.engine) throw new Error("Model not initialized");

    const messages: webllm.ChatCompletionMessageParam[] = [
      { role: "system", content: MEDICAL_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: question },
    ];

    const chunks = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 800,
    });

    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        yield delta;
      }
    }
  }

  isReady(): boolean {
    return this.engine !== null && !this.isLoading;
  }

  async reset(): Promise<void> {
    await this.engine?.resetChat();
  }
}
