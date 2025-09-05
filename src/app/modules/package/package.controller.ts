import status from "http-status";
import { Request, Response, NextFunction } from "express";
import catchAsync from "../../utils/catchAsync";
import { PackageServices } from "./package.service";
import sendResponse from "../../utils/sendResponse";
import { UserRole } from "../user/user.interface";
// import { PackageServices } from "./package.service";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";

const createPackage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PackageServices.createPackage(req.body);
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Package created successfully!",
      data: result,
    });
  }
);

const updatePackage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const packageId = req.params.id;
  const payload = req.body;
  const result = await PackageServices.updatePackage(packageId, payload);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Package updated successfully!",
    data: result,
  });
});

// const getAllPackages = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const result = await PackageServices.getAllPackages();
//     sendResponse(res, {
//       statusCode: status.OK,
//       success: true,
//       message: "Packages fetched successfully!",
//       data: result,
//     });
//   }
// );

const getAllPackages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const role = req.query.role as UserRole | undefined;
  const result = await PackageServices.getAllPackages(role);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Packages fetched successfully!",
    data: result,
  });
});

const getPackageById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PackageServices.getPackageById(req.params.packageId);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Package fetched successfully!",
      data: result,
    });
  }
);

const deletePackage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PackageServices.deletePackage(req.params.packageId);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Package deleted successfully!",
      data: result,
    });
  }
);

export const PackageController = {
  createPackage,
  updatePackage,
  getAllPackages,
  getPackageById,
  deletePackage,
};
