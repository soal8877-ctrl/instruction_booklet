import { z } from "zod";

export const noteFormSchema = z.object({
  title: z.string().trim().min(1, "Укажите заголовок").max(200),
  content: z.string().trim().max(10000),
  isPublic: z.boolean(),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export const noteIdSchema = z.object({
  id: z.string().uuid(),
});
