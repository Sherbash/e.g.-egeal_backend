import { z } from "zod";
import { Interval, PackageType } from "./package.interface";
import { UserRole } from "../user/user.interface";

const WhyThisPackageSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    answer: z.string().min(1, "Answer is required"),
  })
  .optional();

const IntervalEnum = z.enum(Object.values(Interval) as any);
const UserRoleEnum = z.enum(Object.values(UserRole) as any);
const PackageTypeEnum = z.enum(Object.values(PackageType) as any);

const packageValidationSchema = z.object({
  body: z
    .object({
      packageName: z.string().min(1, "Package name is required"),
      description: z
        .string()
        .max(500, "Description must be 500 characters or less")
        .optional(),
      amount: z.number().min(0, "Amount must be positive"),
      currency: z.string().length(3, "Currency must be a 3-letter code"),
      packageType: PackageTypeEnum, // New required field
      interval: IntervalEnum.optional(),
      intervalCount: z
        .number()
        .int()
        .positive("Interval count must be positive")
        .optional(),
      freeTrialDays: z
        .number()
        .int()
        .nonnegative("Free trial days must be non-negative")
        .optional()
        .default(0),
      active: z.boolean().default(true).optional(),
      features: z.any().optional().default([]),
      promotionalMessage: z
        .string()
        .max(1000, "Promotional message must be 1000 characters or less")
        .optional(),
      whyThisPackage: WhyThisPackageSchema,
      isForHome: z.boolean().default(false).optional(),
      roles: z.array(UserRoleEnum).default([]).optional(),
    })
    .refine(
      (data) => {
        if (data.packageType === PackageType.MONTHLY) {
          return (
            data.interval === Interval.MONTH && data.intervalCount !== undefined
          );
        }
        if (data.packageType === PackageType.YEARLY) {
          return (
            data.interval === Interval.YEAR && data.intervalCount !== undefined
          );
        }
        if (data.packageType === PackageType.LIFETIME) {
          return (
            data.interval === undefined && data.intervalCount === undefined
          );
        }
        return false;
      },
      {
        message:
          "For monthly packages, interval must be 'month' and intervalCount must be provided. " +
          "For yearly packages, interval must be 'year' and intervalCount must be provided. " +
          "For lifetime packages, interval and intervalCount must be absent.",
        path: ["packageType"],
      }
    ),
});

export const PackageValidation = {
  packageValidationSchema,
};
