import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 10, // 元の20から減らす
    availableChatModelIds: ['chat-model'], // reasoningモデルを無効化
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 50, // 元の100から減らす
    availableChatModelIds: ['chat-model'], // reasoningモデルを無効化
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
