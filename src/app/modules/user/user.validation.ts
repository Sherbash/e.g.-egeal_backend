import { z } from "zod";
import { UserRole } from "./user.interface";

const userValidationSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: "First name is required",
    }),
    lastName: z.string({
      required_error: "Last name is required",
    }),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email format"),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters"),
    role: z.enum([...(Object.values(UserRole) as [string, ...string[]])], {
      required_error: "Role is required",
    }),
    isActive: z.boolean().optional(),
  }),
});

const userUpdateValidationSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    role: z
      .enum([...(Object.values(UserRole) as [string, ...string[]])])
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export const UserValidation = {
  userValidationSchema,
  userUpdateValidationSchema,
};
