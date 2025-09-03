import mongoose from "mongoose";
import { IPackage } from "./package.interface";
import { stripe } from "../../utils/stripe";
import { PackageModel } from "./package.model";
import AppError from "../../errors/appError";
import status from "http-status";

const createPackage = async (payload: IPackage) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Create Product in Stripe
    const product = await stripe.products.create({
      name: payload.packageName,
      description: payload.description || "",
      active: true,
    });

    // Step 2: Create Price in Stripe
    const recurringData: any = {
      interval: payload.interval,
      interval_count: payload.intervalCount,
    };

    const price = await stripe.prices.create({
      currency: payload.currency,
      unit_amount: Math.round(payload.amount * 100),
      active: true,
      recurring: recurringData,
      product: product.id,
    });

    // Step 3: Create Package Record in Database
    const dbPackage = await PackageModel.create(
      [
        {
          packageName: payload.packageName,
          amount: payload.amount || 0,
          currency: payload.currency,
          interval: payload.interval,
          intervalCount: payload.intervalCount,
          freeTrialDays: payload.freeTrialDays || 0,
          productId: product.id,
          priceId: price.id,
          active: payload.active ?? true,
          description: payload.description,
          features: payload.features || [],
          promotionalMessage: payload.promotionalMessage || null, // Handle new field
          whyThisPackage: payload.whyThisPackage || null, // Handle new field
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return dbPackage[0];
  } catch (error) {
    await session.abortTransaction();
    throw error instanceof AppError
      ? error
      : new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create package");
  } finally {
    session.endSession();
  }
};

const getAllPackages = async () => {
  const packages = await PackageModel.find().lean();
  return packages;
};

const getPackageById = async (packageId: string) => {
  const pkg = await PackageModel.findById(packageId).lean();
  if (!pkg) {
    throw new AppError(
      status.NOT_FOUND,
      `Package with ID ${packageId} not found`
    );
  }
  return pkg;
};

const deletePackage = async (packageId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the package record in the database
    const pkg = await PackageModel.findById(packageId).session(session);
    if (!pkg) {
      throw new AppError(
        status.NOT_FOUND,
        `Package with ID ${packageId} not found`
      );
    }

    // Step 2: Deactivate the price in Stripe
    await stripe.prices.update(pkg.priceId, { active: false });

    // Step 3: Deactivate the product in Stripe
    await stripe.products.update(pkg.productId, { active: false });

    // Step 4: Delete the package record in the database
    await PackageModel.findByIdAndDelete(packageId).session(session);

    await session.commitTransaction();
    return {
      message: `Package with ID ${packageId} archived and deleted successfully`,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error instanceof AppError
      ? error
      : new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete package");
  } finally {
    session.endSession();
  }
};

export const PackageServices = {
  createPackage,
  getAllPackages,
  getPackageById,
  deletePackage,
};
