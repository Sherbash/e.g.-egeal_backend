import z from "zod";

const createToolZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(0, "Price must be non-negative"),
    commissionRate: z.number().min(0, "Commission rate must be non-negative"),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateToolZodSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name is required").optional(),
      description: z.string().min(1, "Description is required").optional(),
      price: z.number().min(0, "Price must be non-negative").optional(),
      commissionRate: z.number().min(0, "Commission rate must be non-negative").optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

export const toolValidation = {
  createToolZodSchema,
  updateToolZodSchema,
};
