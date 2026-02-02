import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});
