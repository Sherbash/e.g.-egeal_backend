import { z } from 'zod';

const createPaymentIntentZodSchema = z.object({
  body: z.object({
    toolId: z.string({
      required_error: 'Tool ID is required',
    }),
    influencerId: z.string().optional(),
  }),
});

export const PaymentValidation = {
  createPaymentIntentZodSchema,
};