import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Groq(XAI)をデフォルトチャットモデルとして使用
        'chat-model': xai('llama3-70b-8192'),
        'chat-model-reasoning': wrapLanguageModel({
          // Groq(XAI)をレゾニングモデルとしても使用
          model: xai('llama3-70b-8192'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('llama3-70b-8192'),
        'artifact-model': xai('llama3-70b-8192'),
      },
      imageModels: {
        'small-model': openai.image('dall-e-3'), // 画像生成はOpenAIのまま
      },
    });
