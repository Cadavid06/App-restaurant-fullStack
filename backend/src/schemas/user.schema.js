import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
  restaurant_id: z
    .preprocess((val) => {
      if (val === null || val === undefined || val === "") return val;
      const n = Number(val);
      return Number.isNaN(n) ? val : n;
    }, z.number().int().positive().nullable().optional()),
});
