import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import type { RequestHints } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
  getUserProfile,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import type { Chat } from '@/lib/db/schema';
import { generatePersonalizedPrompt } from '@/lib/ai/prompts/fitness';

export const runtime = 'nodejs';
export const maxDuration = 60;

let streamContext: ResumableStreamContext | undefined;
try {
  streamContext = createResumableStreamContext({
    waitUntil: after,
  });
} catch (error) {
  console.error('Failed to create resumable stream context:', error);
}

export async function POST(request: Request) {
  console.log('POST /api/chat - Start');

  try {
    const json = await request.json();
    console.log('Request JSON:', JSON.stringify(json, null, 2));

    // useChat から送信される形式に対応
    let message;
    if (
      json.messages &&
      Array.isArray(json.messages) &&
      json.messages.length > 0
    ) {
      const lastMessage = json.messages[json.messages.length - 1];
      message = {
        id: generateUUID(),
        role: lastMessage.role,
        content: lastMessage.content,
        parts: lastMessage.parts || [
          { type: 'text', text: lastMessage.content },
        ],
        experimental_attachments: lastMessage.experimental_attachments || [],
      };
    } else if (json.message) {
      message = json.message;
    } else {
      return new Response(
        JSON.stringify({
          error: 'Message or messages array is required',
          received: Object.keys(json),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // 正規化されたリクエストボディを作成
    const normalizedRequestBody = {
      id: json.id,
      message,
      selectedChatModel: json.selectedChatModel,
      selectedVisibilityType: json.selectedVisibilityType,
    };

    const requestBody = postRequestBodySchema.parse(normalizedRequestBody);
    console.log('Validation successful');

    const { id, selectedChatModel, selectedVisibilityType } = requestBody;

    const session = await auth();
    console.log('Session:', session ? 'Found' : 'Not found');

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // ユーザープロフィール情報を取得
    const userProfile = await getUserProfile(session.user.id);
    console.log('User Profile:', userProfile);

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new Response(
        'You have exceeded your maximum number of messages for the day! Please try again later.',
        {
          status: 429,
        },
      );
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    // メッセージ保存
    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    // プロフィール情報を考慮したシステムプロンプト
    const personalizedSystemPrompt = generatePersonalizedPrompt(
      userProfile || undefined,
    );
    console.log('Personalized Prompt:', personalizedSystemPrompt);

    const stream = createDataStream({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: personalizedSystemPrompt,
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning' ? [] : ['getWeather'],

          tools: {
            getWeather,
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                // 型エラーを修正：assistantMessagesの型を明示的に変換
                const assistantMessages = response.messages.filter(
                  (message) => message.role === 'assistant',
                );

                // UIMessage形式に変換するために、IDを持つメッセージを作成
                const assistantUIMessages = assistantMessages.map((msg) => ({
                  id: generateUUID(), // 新しいIDを生成
                  role: msg.role,
                  content: Array.isArray(msg.content)
                    ? msg.content
                        .map((part) => {
                          if (part.type === 'text') {
                            return part.text;
                          }
                          return JSON.stringify(part);
                        })
                        .join('')
                    : msg.content,
                  parts: Array.isArray(msg.content)
                    ? msg.content
                    : [{ type: 'text', text: msg.content }],
                }));

                const assistantId = getTrailingMessageId({
                  messages: assistantUIMessages as any, // 型アサーション
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (error) {
                console.error('Failed to save messages in database', error);
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    if (!streamContext) {
      return new Response(stream);
    }

    return new Response(
      await streamContext.resumableStream(streamId, () => stream),
    );
  } catch (error) {
    console.error('POST /api/chat detailed error:', error);

    // ZodErrorの型安全な処理
    if (
      error instanceof Error &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      const zodError = error as any;
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: zodError.issues || [],
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('id is required', { status: 400 });
  }

  const session = await auth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new Response('Not found', { status: 404 });
  }

  if (!chat) {
    return new Response('Not found', { status: 404 });
  }

  if (chat.visibility === 'private' && chat.userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new Response('No streams found', { status: 404 });
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new Response('No recent stream found', { status: 404 });
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  if (!streamContext) {
    return new Response(emptyDataStream);
  }

  return new Response(
    await streamContext.resumableStream(recentStreamId, () => emptyDataStream),
    {
      status: 200,
    },
  );
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('id is required', { status: 400 });
  }

  const session = await auth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
