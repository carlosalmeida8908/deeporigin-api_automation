import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  discountPercentage: z.number().optional(),
  rating: z.number().optional(),
  stock: z.number().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  thumbnail: z.string().url().optional(),
  images: z.array(z.string()).optional()
})

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number()
})


export const CategorySchema = z.union([
  z.string(),
  z.object({ slug: z.string(), name: z.string() }).passthrough()
])
export const CategoriesSchema = z.array(CategorySchema)
