import { z } from 'zod';

/* ---------- Helpers ---------- */
const SIZE_LABELS = [
  'Baby',
  '2.2',
  '2.4',
  '2.6',
  '2.8',
  '2.10',
  'Adjustable',
  'Free Size',
] as const;

/* ---------- Size Schema ---------- */
export const variantSizeSchema = z.object({
  label: z.enum(SIZE_LABELS),
  originalPrice: z.number().min(1, 'Price must be greater than 0'),
  discount: z.number().min(0).max(100).optional(),
  finalPrice: z.number().min(1),
  stock: z.number().min(0, 'Stock cannot be negative'),
});

/* ---------- Variant Schema ---------- */
export const variantSchema = z.object({
  collectionId: z.string().min(1, 'Select a collection'),
  productId: z.string().min(1, 'Select a product'),

  skuPrefix: z
    .string()
    .min(3)
    .regex(/^[A-Z0-9-]+$/, 'Only uppercase letters, numbers, hyphens'),

  images: z.array(z.string().url()).min(1),

  sizes: z.array(
    z.object({
      label: z.string(),
      originalPrice: z.number().min(1),
      discount: z.number().min(0).max(100).optional(),
      stock: z.number().min(0),
    })
  ).min(1),

  status: z.enum(['active', 'inactive']),
});

/* ---------- Type ---------- */
export type VariantFormValues = z.infer<typeof variantSchema>;
