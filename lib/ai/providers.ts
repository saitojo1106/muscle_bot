import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq'; // または適切なインポート
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
        // Groq（以前のXAI）をデフォルトチャットモデルとして使用
        'chat-model': groq('llama3-70b-8192'),
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('llama3-70b-8192'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': groq('llama3-70b-8192'),
        'artifact-model': groq('llama3-70b-8192'),
      },
      imageModels: {
        'small-model': openai.image('dall-e-3'),
      },
    });
