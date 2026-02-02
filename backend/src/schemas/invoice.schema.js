import { z } from "zod";

export const createInvoiceSchema = z.object({
  payment_method: z.string().min(1),
});
