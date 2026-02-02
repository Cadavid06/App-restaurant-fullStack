import { z } from "zod";

export const createSizeSchema = z.object({
  name: z.string().min(1),
});

export const updateSizeSchema = z.object({
  name: z.string().min(1),
});