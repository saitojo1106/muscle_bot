// app/chat/page.tsx
'use client';

import { Chat } from '@/components/chat';
import { generateUUID } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const [chatId, setChatId] = useState<string>('');

  useEffect(() => {
    const id = generateUUID();
    setChatId(id);
  }, []);

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-white dark:bg-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-xl font-semibold">Chat with Muscle Bot</h1>
      </div>

      {/* Chat Component */}
      <div className="flex-1">
        <Chat
          id={chatId}
          initialMessages={[]}
          selectedModelId="chat-model"
          selectedVisibilityType="private"
          isReadonly={false}
        />
      </div>
    </div>
  );
}
