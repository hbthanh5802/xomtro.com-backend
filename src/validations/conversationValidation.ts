import { messages } from '@/models/schema';
import { processNumberValidation } from '@/validations/commonValidation';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const insertConversationValidation = z.object({
  members: z.array(z.number()).length(2, { message: 'Invalid [members] params, required [member1, member2]' })
});

export const insertMessageValidation = createInsertSchema(messages, {
  chatId: processNumberValidation,
  content: z.string().optional()
}).pick({
  chatId: true,
  content: true
});
