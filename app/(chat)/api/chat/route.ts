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

    // ユーザーメッセージの内容を取得（言語検出用）
    const userMessageContent = Array.isArray(message.content)
      ? message.content
          .filter(
            (part: any): part is { type: 'text'; text: string } =>
              part.type === 'text' && typeof part.text === 'string',
          )
          .map((part: { type: 'text'; text: string }) => part.text)
          .join('')
      : typeof message.content === 'string'
        ? message.content
        : '';

    // トレーニングメニューを取得
    let trainingMenu = null;
    try {
      const trainingResponse = await fetch(
        `${
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        }/api/training-menu`,
        {
          headers: {
            Cookie: request.headers.get('Cookie') || '',
          },
        },
      );

      if (trainingResponse.ok) {
        const trainingData = await trainingResponse.json();
        trainingMenu = trainingData.trainingDays || [];
      }
    } catch (error) {
      console.log('Failed to fetch training menu:', error);
    }

    // プロフィール情報とトレーニングメニューを考慮したシステムプロンプト
    const personalizedSystemPrompt = generatePersonalizedPrompt(
      userProfile,
      userMessageContent,
      trainingMenu,
    );
    console.log('Personalized Prompt:', personalizedSystemPrompt);

    // 既存のメッセージを取得
    const existingMessages = await getMessagesByChatId({ id });

    // チャットが存在しない場合は先に作成
    if (existingMessages.length === 0) {
      try {
        await saveChat({
          id,
          userId: session.user.id,
          title: await generateTitleFromUserMessage({
            message: userMessageContent,
          }),
          visibility: selectedVisibilityType,
          // createdAt と updatedAt を削除
        });
      } catch (error) {
        console.log('Chat already exists or creation failed:', error);
      }
    }

    // メッセージを適切なフォーマットに変換
    const messages = [
      ...existingMessages.map((msg) => ({
        role: msg.role,
        content: Array.isArray(msg.parts)
          ? msg.parts
              .map((part) =>
                part.type === 'text' ? part.text : JSON.stringify(part),
              )
              .join('')
          : '',
      })),
      {
        role: message.role,
        content: userMessageContent,
      },
    ];

    // ストリームIDを生成
    const streamId = generateUUID();

    // ストリームIDを保存（エラーハンドリング追加）
    try {
      await createStreamId({ streamId, chatId: id });
    } catch (error) {
      console.error('Failed to create stream id in database:', error);
      // ストリームIDなしで続行
    }

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
                // ユーザーメッセージを先に保存
                await saveMessages({
                  messages: [
                    {
                      id: message.id,
                      chatId: id,
                      role: message.role,
                      parts: message.parts,
                      attachments: message.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });

                // アシスタントメッセージを保存
                const assistantMessages = response.messages.filter(
                  (message) => message.role === 'assistant',
                );

                const assistantUIMessages = assistantMessages.map((msg) => ({
                  id: generateUUID(),
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
                  messages: assistantUIMessages as any,
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

    // ストリームIDが作成できた場合のみresumableStreamを使用
    try {
      return new Response(
        await streamContext.resumableStream(streamId, () => stream),
      );
    } catch (error) {
      console.error('Resumable stream error:', error);
      return new Response(stream);
    }
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
