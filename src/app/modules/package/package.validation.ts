import { z } from "zod";
// import { Interval } from "./package.interface";

// const IntervalEnum = z.enum(Object.values(Interval));

const packageValidationSchema = z.object({
  body: z.object({
    packageName: z.string().min(1, "Package name is required"),
    description: z
      .string()
      .max(500, "Description must be 500 characters or less")
      .optional(),
    amount: z.number().min(0, "Amount must be positive"),
    currency: z.string().length(3, "Currency must be a 3-letter code"),
    // interval: IntervalEnum.default(Interval.MONTH),
    intervalCount: z.number().int().positive("Interval count must be positive"),
    freeTrialDays: z
      .number()
      .int()
      .nonnegative("Free trial days must be non-negative")
      .optional()
      .default(0),
    active: z.boolean().default(true).optional(),
    features: z.any().optional().default([]),
  }),
});

export const PackageValidation = {
  packageValidationSchema,
};
