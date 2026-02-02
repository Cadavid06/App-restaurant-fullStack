import { z } from "zod";

export const createOrderSchema = z.object({
  tableNumber: z.number().int().positive(),
  products: z.array(
    z.object({
      name: z.string().min(1),
      amount: z.number().int().positive(),
    })
  ).min(1),
});

export const updateOrderSchema = z.object({
  tableNumber: z.number().int().positive(),
  products: z.array(
    z.object({
      product_id: z.number().int().positive(),
      amount: z.number().int().positive(),
    })
  ).min(1),
});
