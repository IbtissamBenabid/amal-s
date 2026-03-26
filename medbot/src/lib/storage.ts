import { openDB, DBSchema, IDBPDatabase } from "idb";
import { EmergencyLevel } from "./medicalBot";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  emergencyLevel?: EmergencyLevel;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MedBotDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { updatedAt: Date };
  };
}

const DB_NAME = "medbot-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<MedBotDB> | null = null;

export const initDB = async (): Promise<IDBPDatabase<MedBotDB>> => {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<MedBotDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore("conversations", { keyPath: "id" });
      store.createIndex("updatedAt", "updatedAt");
    },
  });
  return dbInstance;
};

export const saveConversation = async (
  conversation: Conversation
): Promise<void> => {
  const db = await initDB();
  await db.put("conversations", {
    ...conversation,
    updatedAt: new Date(),
  });
};

export const loadConversation = async (
  id: string
): Promise<Conversation | undefined> => {
  const db = await initDB();
  return db.get("conversations", id);
};

export const getAllConversations = async (): Promise<Conversation[]> => {
  const db = await initDB();
  const all = await db.getAllFromIndex("conversations", "updatedAt");
  return all.reverse();
};

export const deleteConversation = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete("conversations", id);
};

export const searchConversations = async (
  keyword: string
): Promise<Conversation[]> => {
  const db = await initDB();
  const all = await db.getAll("conversations");
  const lower = keyword.toLowerCase();
  return all.filter(
    (c) =>
      c.title.toLowerCase().includes(lower) ||
      c.messages.some((m) => m.content.toLowerCase().includes(lower))
  );
};

export const exportConversation = (conversation: Conversation): string => {
  let text = `MedBot - Conversation: ${conversation.title}\n`;
  text += `Date: ${new Date(conversation.createdAt).toLocaleDateString("fr-FR")}\n`;
  text += `Modèle: ${conversation.model}\n`;
  text += `${"=".repeat(60)}\n\n`;

  for (const msg of conversation.messages) {
    const sender = msg.role === "user" ? "Vous" : "MedBot";
    const time = new Date(msg.timestamp).toLocaleTimeString("fr-FR");
    text += `[${time}] ${sender}:\n${msg.content}\n\n`;
  }

  text += `${"=".repeat(60)}\n`;
  text += `⚠️ Ce contenu est fourni à titre informatif uniquement.\n`;
  text += `Consultez toujours un professionnel de santé.\n`;

  return text;
};
