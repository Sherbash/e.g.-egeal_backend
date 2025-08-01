import Stripe from "stripe";

const getStripeInstance = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil", 
    // apiVersion: "2023-10-16", 
  });
};

/**
 * Creates a Stripe Checkout Session
 * @param {Object} params - Parameters for session creation
 * @param {string} params.toolName - Name of the tool
 * @param {number} params.price - Price in dollars
 * @param {string} params.toolId - Tool ID
 * @param {string} [params.influencerId] - Influencer ID (optional)
 * @param {string} clientUrl - Client URL for success/cancel redirects
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export const createCheckoutSession = async (
  { toolName, price, toolId, influencerId }: { toolName: string; price: number; toolId: string; influencerId?: string },
  clientUrl: string
) => {
  const stripe = getStripeInstance();
  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: toolName },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${clientUrl}/tool/${toolId}?payment=success`,
    cancel_url: `${clientUrl}/tool/${toolId}?payment=cancel`,
    metadata: {
      toolId,
      influencerId: influencerId || "",
    },
  });
};

export { getStripeInstance };