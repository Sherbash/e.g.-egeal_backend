import mongoose from "mongoose";
import { IPackage, PackageType } from "./package.interface";
import { stripe } from "../../utils/stripe";
import { PackageModel } from "./package.model";
import AppError from "../../errors/appError";
import status from "http-status";
import { UserRole } from "../user/user.interface";

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
    const priceConfig: any = {
      currency: payload.currency,
      unit_amount: Math.round(payload.amount * 100),
      active: true,
      product: product.id,
    };

    // Add recurring data based on packageType
    if (payload.packageType === PackageType.MONTHLY || payload.packageType === PackageType.YEARLY) {
      priceConfig.recurring = {
        interval: payload.interval,
        interval_count: payload.intervalCount,
      };
    } // No recurring data for lifetime packages

    const price = await stripe.prices.create(priceConfig);

    // Step 3: Create Package Record in Database
    const dbPackage = await PackageModel.create(
      [
        {
          packageName: payload.packageName,
          amount: payload.amount || 0,
          currency: payload.currency,
          packageType: payload.packageType,
          interval: payload.interval || null,
          intervalCount: payload.intervalCount || null,
          freeTrialDays: payload.freeTrialDays || 0,
          productId: product.id,
          priceId: price.id,
          active: payload.active ?? true,
          description: payload.description,
          features: payload.features || [],
          promotionalMessage: payload.promotionalMessage || null,
          whyThisPackage: payload.whyThisPackage || null,
          isForHome: payload.isForHome ?? false,
          roles: payload.roles || [],
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return dbPackage[0];
  } catch (error) {
    await session.abortTransaction();
    throw error instanceof AppError ? error : new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create package");
  } finally {
    session.endSession();
  }
};

const updatePackage = async (packageId: string, payload: Partial<IPackage>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the existing package
    const existingPackage = await PackageModel.findById(packageId).session(session);
    if (!existingPackage) {
      throw new AppError(status.NOT_FOUND, `Package with ID ${packageId} not found`);
    }

    // Step 2: Prepare update data
    const updateData: Partial<IPackage> = {
      packageName: payload.packageName ?? existingPackage.packageName,
      amount: payload.amount ?? existingPackage.amount,
      currency: payload.currency ?? existingPackage.currency,
      packageType: payload.packageType ?? existingPackage.packageType,
      interval: payload.packageType === PackageType.LIFETIME ? null : payload.interval ?? existingPackage.interval,
      intervalCount: payload.packageType === PackageType.LIFETIME ? null : payload.intervalCount ?? existingPackage.intervalCount,
      freeTrialDays: payload.freeTrialDays ?? existingPackage.freeTrialDays,
      active: payload.active ?? existingPackage.active,
      description: payload.description !== undefined ? payload.description : existingPackage.description,
      features: payload.features ?? existingPackage.features,
      promotionalMessage: payload.promotionalMessage !== undefined ? payload.promotionalMessage : existingPackage.promotionalMessage,
      whyThisPackage: payload.whyThisPackage !== undefined ? payload.whyThisPackage : existingPackage.whyThisPackage,
      isForHome: payload.isForHome ?? existingPackage.isForHome,
      roles: payload.roles ?? existingPackage.roles,
    };

    // Step 3: Update Stripe product if necessary
    if (payload.packageName || payload.description || payload.active !== undefined) {
      await stripe.products.update(existingPackage.productId, {
        name: updateData.packageName,
        description: updateData.description || "",
        active: updateData.active ?? true,
      });
    }

    // Step 4: Create new Stripe price if pricing fields change
    let newPriceId = existingPackage.priceId;
    if (
      payload.amount !== undefined ||
      payload.currency !== undefined ||
      payload.packageType !== undefined ||
      payload.interval !== undefined ||
      payload.intervalCount !== undefined
    ) {
      const priceConfig: any = {
        currency: updateData.currency,
        unit_amount: Math.round((updateData.amount || 0) * 100),
        active: true,
        product: existingPackage.productId,
      };

      if (updateData.packageType === PackageType.MONTHLY || updateData.packageType === PackageType.YEARLY) {
        priceConfig.recurring = {
          interval: updateData.interval,
          interval_count: updateData.intervalCount,
        };
      }

      const newPrice = await stripe.prices.create(priceConfig);
      newPriceId = newPrice.id;

      // Deactivate old price
      await stripe.prices.update(existingPackage.priceId, { active: false });
    }

    // Step 5: Update package in database
    const updatedPackage = await PackageModel.findByIdAndUpdate(
      packageId,
      { ...updateData, priceId: newPriceId },
      { new: true, session }
    );

    if (!updatedPackage) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update package in database");
    }

    await session.commitTransaction();
    return updatedPackage;
  } catch (error) {
    await session.abortTransaction();
    throw error instanceof AppError ? error : new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update package");
  } finally {
    session.endSession();
  }
};

// const getAllPackages = async () => {
//   const packages = await PackageModel.find().lean();
//   return packages;
// };

const getAllPackages = async (role?: UserRole) => {
  const query: any = {};
  if (role) {
    query.roles = { $in: [role] };
  } else {
    // Include packages with empty roles array or no roles
    query.$or = [{ roles: { $exists: false } }, { roles: { $size: 0 } }, { roles: { $ne: null } }];
  }
  const packages = await PackageModel.find(query).lean();
  return packages;
};

const getPackageById = async (packageId: string) => {
  const pkg = await PackageModel.findById(packageId).lean();
  if (!pkg) {
    throw new AppError(status.NOT_FOUND, `Package with ID ${packageId} not found`);
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
      throw new AppError(status.NOT_FOUND, `Package with ID ${packageId} not found`);
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
    throw error instanceof AppError ? error : new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete package");
  } finally {
    session.endSession();
  }
};

export const PackageServices = {
  createPackage,
  updatePackage,
  getAllPackages,
  getPackageById,
  deletePackage,
};