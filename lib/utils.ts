// lib/utils.ts
import type { CoreAssistantMessage, CoreToolMessage, UIMessage } from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Document } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid'; // ← 正式なUUIDパッケージを使用

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: any;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }
  return null;
}

// PostgreSQL UUID形式に対応 - 正式なUUID v4を使用
export function generateUUID(): string {
  return uuidv4();
}

// メッセージIDやその他の用途では nanoid を使用
export function generateId(): string {
  return nanoid();
}

export function generateRandomString() {
  return Math.random().toString(36).substring(2, 15);
}

export function getMostRecentUserMessage(messages: UIMessage[]) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents.length) return new Date();
  if (index > documents.length - 1) return new Date();

  return documents[index].createdAt;
}

export function getTrailingMessageId({ messages }: { messages: UIMessage[] }) {
  const trailingMessage = messages.at(-1);
  if (!trailingMessage) return null;

  return trailingMessage.id;
}
