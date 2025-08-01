import status from "http-status";
import AppError from "../errors/appError";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";

export const parseBody = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      throw new AppError(
        status.BAD_REQUEST,
        "Please provide data in the body under data key"
      );
    }
    req.body = JSON.parse(req.body.data);

    next();
  }
);
