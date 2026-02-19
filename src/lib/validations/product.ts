// src/lib/validations/product.ts
import { z } from 'zod';


/* ---------- Helpers ---------- */

// slug: lowercase, hyphen-separated, no spaces
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Cloudinary image (basic safety check)
const cloudinaryUrlRegex =
  /^https:\/\/res\.cloudinary\.com\/.+\/image\/upload\/.+$/;

export const productSchema = z.object({
  /* ---------- BASIC INFO ---------- */

  name: z
    .string()
    .trim()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name cannot exceed 100 characters'),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Slug is required')
    .max(120, 'Slug is too long')
    .regex(
      slugRegex,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),

  /* ---------- COLLECTION ---------- */

  collectionName: z
    .string()
    .trim()
    .min(1, 'Collection name is required'),

  /* ---------- CONTENT ---------- */

  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),

  /* ---------- IMAGE ---------- */

  thumbnail: z
    .string()
    .trim()
    .url('Invalid image URL')
    .regex(
      cloudinaryUrlRegex,
      'Image must be uploaded via Cloudinary'
    ),

    /* ---------- PRICE RANGE ---------- */
    priceRange: z
    .object({
      min: z.number().min(1, 'Min price must be greater than 0'),
      max: z.number().min(1, 'Max price must be greater than 0'),
    })
    .refine(
      (data) => data.max >= data.min,
      {
        message: 'Max price must be greater than or equal to min price',
        path: ['maxPrice'],
      }
    ),

    occasions: z
    .array(z.string())
    .min(1, 'Select at least one occasion'),

  /* ---------- STATUS ---------- */


  status: z.enum(['published', 'draft'], {
    errorMap: () => ({ message: 'Invalid product status' }),
  }),
});

/* ---------- TYPE ---------- */
export type ProductFormValues = z.infer<typeof productSchema>;
