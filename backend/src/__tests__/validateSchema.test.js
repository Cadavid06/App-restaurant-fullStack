import { z } from "zod";
import { validateSchema } from "../middlewares/validateSchema.js";

describe("validateSchema middleware", () => {
  test("returns 400 with errors when schema fails", () => {
    const schema = z.object({ a: z.string().min(1) });
    const req = { body: { a: "" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const mw = validateSchema(schema);
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    const callArg = res.json.mock.calls[0][0];
    expect(callArg).toHaveProperty("errors");
    expect(Array.isArray(callArg.errors)).toBe(true);
    expect(callArg.errors.length).toBeGreaterThan(0);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next and sets parsed value on success", () => {
    const schema = z.object({ n: z.preprocess((v) => Number(v), z.number().int().positive()) });
    const req = { body: { n: "42" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const mw = validateSchema(schema);
    mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.n).toBe(42);
  });
});
