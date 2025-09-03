// import status from "http-status";

// import { Request, Response } from "express";
// import catchAsync from "../../utils/catchAsync";
// import AppError from "../../errors/appError";
// import { CouponServices } from "./coupon.service";
// import sendResponse from "../../utils/sendResponse";
// import { ICoupon } from "./coupon.interface";

// // coupon.controller.ts
// const createCoupon = catchAsync(async (req: Request, res: Response) => {
//   const payload = req.body;

//   const result = await CouponServices.createCouponIntoDB(payload);

//   sendResponse(res, {
//     statusCode: status.CREATED, 
//     success: true,
//     message: "Coupon created successfully",
//     data: result,
//   });
// });

// const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
//   const result = await CouponServices.getAllCouponsFromDB();
//   sendResponse(res, {
//     success: true,
//     statusCode: status.OK,
//     message: "Coupons fetched successfully",
//     data: result,
//   });
// });

// const getMyCoupons = catchAsync(async (req: Request, res: Response) => {
  
// const { id } = req.params; // Extract user ID from URL
//   const result = await CouponServices.getMyCouponsFromDB(id);

//   sendResponse(res, {
//     success: true,
//     statusCode: status.OK,
//     message: "Coupons fetched successfully",
//     data: result,
//   });
// });

// // coupon.controller.ts
// const applyCoupon = catchAsync(async (req: Request, res: Response) => {
//   const { code, toolPrice, toolId, usedBy } = req.body;
//   if (!code || toolPrice == null || !usedBy) {
//     throw new AppError(status.BAD_REQUEST, "code, toolPrice, and usedBy are required");
//   }

//   const result = await CouponServices.applyCoupon(
//     code,
//     Number(toolPrice),
//     usedBy, // Pass user ID from req.body.usedBy
//     toolId
//   );

//   sendResponse(res, {
//     success: true,
//     statusCode: status.OK,
//     message: "Coupon applied successfully",
//     data: result,
//   });
// });



// export const CouponControllers = {
//   createCoupon,
//   getAllCoupons,
//   applyCoupon,
//   getMyCoupons
// };


//! Version - 2

import status from "http-status";

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../errors/appError";
import { CouponServices } from "./coupon.service";
import sendResponse from "../../utils/sendResponse";
import { ICoupon } from "./coupon.interface";
import pickOptions from "../../utils/pick";

// coupon.controller.ts
const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await CouponServices.createCouponIntoDB(payload);

  sendResponse(res, {
    statusCode: status.CREATED, 
    success: true,
    message: "Coupon created successfully",
    data: result,
  });
});

const getAllCouponsByUserIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const filters = pickOptions(req.query, ["searchTerm"]);

  const result = await CouponServices.getAllCouponsByUserIdFromDB(userId, filters);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupons fetched successfully",
    data: result,
  });
});


const getSingleCouponByIdWithUserIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { couponId } = req.params;
  const userId = req.user?.id; 

  const result = await CouponServices.getSingleCouponByIdWithUserIdFromDB(couponId, userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupon fetched successfully",
    data: result,
  });
});

const updateSingleCouponByIdWithUserIdIntoDB = catchAsync(
  async (req: Request, res: Response) => {
    const { couponId } = req.params;
    const userId = req.user?.id;

    const result = await CouponServices.updateSingleCouponByIdWithUserIdIntoDB(
      couponId,
      userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Coupon updated successfully",
      data: result,
    });
  }
);

const softDeleteSingleCouponByIdWithUserIdIntoDB = catchAsync(
  async (req: Request, res: Response) => {
    const { couponId } = req.params;
    const userId = req.user?.id;

    const result = await CouponServices.softDeleteSingleCouponByIdWithUserIdIntoDB(
      couponId,
      userId
    );

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Coupon deleted successfully",
      data: result,
    });
  }
)

const getMyCoupons = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // Extract user ID from URL
  const result = await CouponServices.getMyCouponsFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupons fetched successfully",
    data: result,
  });
});

// coupon.controller.ts
const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, toolPrice, toolId, usedBy } = req.body;
  if (!code || toolPrice == null || !usedBy) {
    throw new AppError(
      status.BAD_REQUEST,
      "code, toolPrice, and usedBy are required"
    );
  }

  const result = await CouponServices.applyCoupon(
    code,
    Number(toolPrice),
    usedBy, // Pass user ID from req.body.usedBy
    toolId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupon applied successfully",
    data: result,
  });
});

export const CouponControllers = {
  createCoupon,
  getAllCouponsByUserIdFromDB,
  getSingleCouponByIdWithUserIdFromDB,
  updateSingleCouponByIdWithUserIdIntoDB,
  softDeleteSingleCouponByIdWithUserIdIntoDB,

  applyCoupon,
  getMyCoupons,
};
