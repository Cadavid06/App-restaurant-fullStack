import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  // role is the role name sent by client (e.g., 'Admin')
  role: z.string().min(1),
  restaurant_id: z
    .preprocess((val) => {
      if (val === null || val === undefined || val === "") return val;
      const n = Number(val);
      return Number.isNaN(n) ? val : n;
    }, z.number().int().positive().nullable().optional()),
});
