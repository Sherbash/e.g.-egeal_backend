// import Stripe from 'stripe';
// import config from '../config';
// import { ToolModel } from '../modules/tool/tool.model';
// import { Payment } from '../modules/payment/payment.model';
// import { PaymentStatus } from '../modules/payment/payment.interface';
// import { Affiliate } from '../modules/affiliate/affiliate.model';
// import mongoose from 'mongoose';
// import AppError from '../errors/appError';
// import status from 'http-status';

// // Initialize Stripe with your secret key
// const stripe = new Stripe(config.stripe_secret_key as string, {
//   apiVersion: '2025-06-30.basil', // Use the latest API version
// });

// /**
//  * Create a Stripe payment intent
//  * @param userId - The user's ObjectId
//  * @param toolId - The tool's ID (string)
//  * @param influencerId - Optional influencer ID for affiliate tracking
//  */
// export const createStripePaymentIntent = async (
//   userId: string,
//   toolId: string,
//   influencerId?: string
// ) => {
//   // Start a session for transaction
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Find the tool by toolId
//     const tool = await ToolModel.findOne({ toolId }).session(session);
//     if (!tool) {
//       throw new AppError(status.NOT_FOUND, 'Tool not found');
//     }

//     // Check if the tool is active
//     if (!tool.isActive) {
//       throw new AppError(status.BAD_REQUEST, 'This tool is not available for purchase');
//     }

//     // Create metadata for the payment intent
//     const metadata: Record<string, string> = {
//       userId,
//       toolId,
//       toolName: tool.name,
//     };

//     // Add influencer ID to metadata if provided
//     if (influencerId) {
//       metadata.influencerId = influencerId;

//       // Verify the affiliate relationship exists
//       const affiliate = await Affiliate.findOne({
//         influencerId,
//         toolId,
//       }).session(session);

//       if (!affiliate) {
//         throw new AppError(status.NOT_FOUND, 'Invalid affiliate link');
//       }
//     }

//     // Create a payment intent with Stripe
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(tool.price * 100), // Convert to cents
//       currency: 'usd',
//       metadata,
//     });

//     // Create a payment record in our database
//     const payment = {
//       user: new mongoose.Types.ObjectId(userId),
//       tool: toolId, // Store toolId as string
//       influencerId, // Store influencerId if provided
//       amount: tool.price,
//       currency: 'usd',
//       paymentIntentId: paymentIntent.id,
//       status: PaymentStatus.PENDING,
//       metadata: {
//         toolName: tool.name,
//       },
//     };

//     await Payment.create([payment], { session });
//     await session.commitTransaction();
//     session.endSession();

//     return {
//       clientSecret: paymentIntent.client_secret,
//       paymentIntentId: paymentIntent.id,
//       amount: tool.price,
//       toolName: tool.name,
//     };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

// /**
//  * Handle a successful payment
//  * @param paymentIntent - The Stripe payment intent object
//  */
// export const handleSuccessfulPayment = async (paymentIntent: Stripe.PaymentIntent) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Extract metadata
//     const { userId, toolId, influencerId } = paymentIntent.metadata;

//     // Update payment status in database
//     const payment = await Payment.findOne({
//       paymentIntentId: paymentIntent.id,
//     }).session(session);

//     if (!payment) {
//       throw new AppError(status.NOT_FOUND, 'Payment record not found');
//     }

//     // Update payment status
//     payment.status = PaymentStatus.COMPLETED;
//     payment.paymentMethod = paymentIntent.payment_method as string;
//     await payment.save({ session });

//     // If there's an influencer, update their affiliate record
//     if (influencerId) {
//       const affiliate = await Affiliate.findOne({
//         influencerId,
//         toolId,
//       }).session(session);

//       if (affiliate) {
//         // Increment conversions
//         affiliate.conversions += 1;
        
//         // Calculate and add earnings based on commission rate
//         const tool = await ToolModel.findOne({ toolId }).session(session);
//         if (tool) {
//           const commission = tool.price * (affiliate.commissionRate / 100);
//           affiliate.earning += commission;
//         }
        
//         await affiliate.save({ session });
//       }
//     }

//     // Here you would update the user's purchased tools if needed
//     // This depends on your user model structure

//     await session.commitTransaction();
//     session.endSession();
//     return payment;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

// /**
//  * Handle a failed payment
//  * @param paymentIntent - The Stripe payment intent object
//  */
// export const handleFailedPayment = async (paymentIntent: Stripe.PaymentIntent) => {
//   try {
//     const payment = await Payment.findOneAndUpdate(
//       { paymentIntentId: paymentIntent.id },
//       { status: PaymentStatus.FAILED }
//     );
//     return payment;
//   } catch (error) {
//     console.error('Error handling failed payment:', error);
//     throw error;
//   }
// };

// /**
//  * Process a Stripe webhook event
//  * @param event - The Stripe event object
//  */
// export const processStripeWebhookEvent = async (event: Stripe.Event) => {
//   try {
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntent = event.data.object as Stripe.PaymentIntent;
//         await handleSuccessfulPayment(paymentIntent);
//         break;
//       case 'payment_intent.payment_failed':
//         const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
//         await handleFailedPayment(failedPaymentIntent);
//         break;
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }
//     return true;
//   } catch (error) {
//     console.error('Error handling webhook event:', error);
//     throw error;
//   }
// };

// /**
//  * Verify a Stripe webhook signature
//  * @param payload - The raw request body
//  * @param signature - The Stripe signature header
//  */
// export const verifyStripeWebhookSignature = (payload: string | Buffer, signature: string) => {
//   try {
//     const endpointSecret = config.stripe_webhook_secret as string;
//     const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
//     return event;
//   } catch (err: any) {
//     throw new AppError(status.BAD_REQUEST, `Webhook Error: ${err.message}`);
//   }
// };