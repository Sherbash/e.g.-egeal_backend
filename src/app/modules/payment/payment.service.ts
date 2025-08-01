import Stripe from "stripe";
import config from "../../config";
import { Payment } from "./payment.model";
import { Types } from "mongoose";
import { PaymentStatus } from "./payment.interface";
import { Affiliate } from "../affiliate/affiliate.model";
import { ToolModel } from "../tool/tool.model";
import UserModel from "../user/user.model";
import { Founder } from "../founder/founder.model";
import { Influencer } from "../influencer/influencer.model";
import { sendEmail } from "../../utils/emailHelper";

const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

interface IPaymentPayload {
  toolName: string;
  price: number;
  userId: string;
  toolId: string;
  influencerId?: string;
}

const createCheckoutSession = async (payload: IPaymentPayload) => {
  const { toolName, price, userId, toolId, influencerId } = payload;

  // Validate required fields
  if (!toolName || !price || !userId || !toolId) {
    throw new Error("Tool name, price, toolId, and userId are required");
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { 
          name: toolName,
          metadata: { toolId } // Additional backup
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: 1,
    }],
    success_url: `${config.client_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.client_url}/payment/cancel`,
    metadata: { 
      userId,
      toolName,
      toolId,
      price: price.toString(),
      ...(influencerId && { influencerId }) // Only include if exists
    }
  };

  const session = await stripe.checkout.sessions.create(sessionParams);
  return { 
    url: session.url,
    sessionId: session.id
  };
};





// const confirmPaymentAndSave = async (sessionId: string) => {
//   const session = await stripe.checkout.sessions.retrieve(sessionId, {
//     expand: ['payment_intent']
//   });

//   if (!session.payment_intent) {
//     throw new Error("Payment Intent not found");
//   }

//   const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
//   const { userId, toolName, toolId, price, influencerId } = session.metadata || {};

//   // Validate required metadata
//   const requiredFields = { userId, toolName, toolId, price };
//   const missingFields = Object.entries(requiredFields)
//     .filter(([_, value]) => !value)
//     .map(([key]) => key);

//   if (missingFields.length > 0) {
//     throw new Error(`Missing metadata: ${missingFields.join(', ')}`);
//   }

//   // Create payment data (conditionally add influencerId)
//   const paymentData = {
//     user: new Types.ObjectId(userId),
//     toolName,
//     toolId,
//     price: Number(price),
//     stripeSessionId: sessionId,
//     paymentIntentId: paymentIntent.id,
//     status: paymentIntent.status === 'succeeded' 
//       ? PaymentStatus.COMPLETED 
//       : PaymentStatus.PENDING,
//     ...(influencerId && { influencerId }) 
//   };

//   const payment = await Payment.create(paymentData);
  
//   // If payment is completed and has an influencer, update affiliate earnings
//   if (payment.status === PaymentStatus.COMPLETED && influencerId) {
//     // Find the tool to get the commission rate
//     const tool = await ToolModel.findOne({ toolId });
    
//     if (tool) {
//       // Find and update the affiliate
//       await Affiliate.findOneAndUpdate(
//         { influencerId, toolId },
//         { 
//           $inc: { conversions: 1 },
//           // No need to calculate earnings here, just use the tool's commission rate
//         }
//       );
//     }
//   }
  
//  return payment;
// };




const confirmPaymentAndSave = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent']
  });

  if (!session.payment_intent) {
    throw new Error("Payment Intent not found");
  }

  const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
  const { userId, toolName, toolId, price, influencerId } = session.metadata || {};

  const requiredFields = { userId, toolName, toolId, price };
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new Error(`Missing metadata: ${missingFields.join(', ')}`);
  }

  const paymentData = {
    user: new Types.ObjectId(userId),
    toolName,
    toolId,
    price: Number(price),
    stripeSessionId: sessionId,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status === 'succeeded' 
      ? PaymentStatus.COMPLETED 
      : PaymentStatus.PENDING,
    ...(influencerId && { influencerId }) 
  };

  const payment = await Payment.create(paymentData);

if (payment.status === PaymentStatus.COMPLETED && influencerId) {
  const tool = await ToolModel.findOne({ toolId });
  if (tool && tool.commissionRate) {
    // Calculate commission (assuming commissionRate is a percentage)
    const commissionAmount = Number(price) * (tool.commissionRate / 100);
    
    await Affiliate.findOneAndUpdate(
      { influencerId, toolId },
      { 
        $inc: { 
          conversions: 1,
          earning: commissionAmount 
        } 
      },
      { new: true } // Return the updated document
    );
  }
}

  // ✅ Prepare recipients
  const buyer = await UserModel.findById(userId);

  const founder = await Founder.findOne({ userId: new Types.ObjectId(userId) }).populate("userId");
  const influencer = influencerId
    ? await Influencer.findOne({ influencerId }).populate("userId")
    : null;

  const subject = `✅ Payment Confirmed for ${toolName}`;
  const message = `
    <h2>Payment Confirmation</h2>
    <p><strong>Tool:</strong> ${toolName}</p>
    <p><strong>Amount:</strong> $${price}</p>
    <p><strong>Status:</strong> ${payment.status}</p>
  `;

  // 🔔 Send to buyer
  if (buyer?.email) {
    await sendEmail(buyer.email, subject, `<p>Hi ${buyer.firstName},</p>${message}`);
  }

  // 🔔 Send to influencer if available
  if (influencer?.userId && (influencer.userId as any).email) {
    await sendEmail((influencer.userId as any).email, subject, `<p>You referred a purchase!</p>${message}`);
  }

  // 🔔 Send to founder (tool owner)
  if (founder?.userId && (founder.userId as any).email) {
    await sendEmail((founder.userId as any).email, subject, `<p>Your product was purchased!</p>${message}`);
  }

  // 🔔 Send to admin
  await sendEmail("smhasanjamil14@gmail.com", subject, `<p>Admin notice: A tool was purchased.</p>${message}`);

  return payment;
};


const getPaymentsByUserId = async (userId: string) => {
  return await Payment.find({ user: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
};

export const paymentService = {
  createCheckoutSession,
  confirmPaymentAndSave,
  getPaymentsByUserId,
};