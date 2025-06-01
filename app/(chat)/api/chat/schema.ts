import { z } from 'zod';

export const postRequestBodySchema = z.object({
  id: z.string(),
  message: z.object({
    id: z.string(),
    role: z.literal('user'),
    content: z.string(),
    parts: z.array(
      z.object({
        type: z.string(),
        text: z.string(),
      }),
    ),
    experimental_attachments: z.array(z.any()).optional(),
  }),
  selectedChatModel: z.string(),
  selectedVisibilityType: z.enum(['private', 'public']),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
