// import { z } from "zod";

// const investorWaitlistSchema = z.object({
//   body: z.object({
//     email: z.string().email("Invalid email address"),
//     toolId: z.string().nonempty("Tool ID is required"),
//     investmentAmount: z.number().positive("Investment amount must be positive"),
//   }),
// });

// export const investorWaitlistValidation = {
//   investorWaitlistSchema,
// };

 


import { z } from "zod";

const investorWaitlistSchema = z.object({
  body: z.object({
    name: z.string().nonempty("Name is required"),
    company: z.string().nonempty("Company is required"),
    email: z.string().email("Invalid email address"),
    aboutYou: z.string().optional(),
    niche: z.string().optional(),
    range: z.string().optional(),
    type: z.string().optional(),
    stage: z.string().optional(),
    region: z.string().optional(),
    linkedIn: z.string().optional(),
    source: z.string().optional(),
  }),
});

export const investorWaitlistValidation = {
  investorWaitlistSchema,
};