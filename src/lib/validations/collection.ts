import { z } from 'zod';

export const collectionSchema = z.object({
  name: z
    .string()
    .min(4, { message: 'Collection name must be at least 4 characters' })
    .max(50, { message: 'Collection name must be at most 50 characters' }),

  slug: z
    .string()
    .min(4, { message: 'Slug must be at least 4 characters' })
    .max(60, { message: 'Slug must be at most 60 characters' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug can contain only lowercase letters, numbers, and hyphens',
    }),

  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(200, { message: 'Description must be at most 200 characters' })
    .optional(),

  coverImage: z
    .string()
    .url({ message: 'Cover image must be a valid URL' }),

});

export type CollectionFormValues = z.infer<typeof collectionSchema>;


