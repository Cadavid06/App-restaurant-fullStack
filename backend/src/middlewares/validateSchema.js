import { ZodError } from "zod";

/**
 * Middleware factory to validate request data using Zod schemas
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {string} target - one of 'body' | 'params' | 'query'
 */
export const validateSchema = (schema, target = "body") => {
  return (req, res, next) => { 
    try {
      const parsed = schema.parse(req[target]);
      // Attach parsed value back to request to ensure downstream has typed/parsed data
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues || [];
        const details = issues.map((e) => ({ path: (e.path || []).join('.'), message: e.message }));
        const messages = details.map((d) => d.message);
        return res.status(400).json({ message: "Validation error", errors: messages, details });
      }

      console.error("Unexpected validation error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
