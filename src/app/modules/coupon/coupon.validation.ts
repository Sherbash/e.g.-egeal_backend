import { z } from "zod";

const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(20),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().positive(),
    toolId: z.string().optional(),
    maxUsage: z.number().int().positive().optional(),
    expiresAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
      .transform((str) => new Date(str + "T23:59:59.000Z")) // Convert to end-of-day UTC
      .refine(
        (date) => date > new Date(),
        "Expiration date must be in the future"
      )
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    validatedFor: z.enum(["PACKAGE", "TOOL"]),
  }),
});

const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(20),
    toolPrice: z.number().positive(),
    toolId: z.string().optional(),
  }),
});

const getPackageCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(20),
    packagePrice: z.number().positive(),
    packageId: z.string().refine(
      (val) => /^[0-9a-fA-F]{24}$/.test(val),
      { message: "Invalid package ID" }
    ),
  }),
});

export const CouponValidations = {
  createCouponSchema,
  applyCouponSchema,
  getPackageCouponSchema,
};
