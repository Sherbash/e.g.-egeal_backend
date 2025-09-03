import z from "zod";

const createContactPackageSchema = z.object({
  body: z.object({
    name: z.string().nonempty("Name is required"),
    email: z.string().email("Invalid email address"),
    message: z.string().nonempty("Message is required"),
  }),
});

export const contactPackageValidation = {
  createContactPackageSchema,
};