import { z } from "zod";

const priceNumber = z.preprocess((val) => (val === "" || val === null || val === undefined ? val : Number(val)), z.number().positive());

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: priceNumber,
  category: z.string().min(1),
  size: z.string().optional().nullable(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: priceNumber,
  category: z.string().min(1),
  size: z.string().optional().nullable(),
});
