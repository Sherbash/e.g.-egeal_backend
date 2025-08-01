import { Request, Response } from "express";
import status from "http-status";
import { CourseServices } from "./course.service";
import catchAsync from "../../utils/catchAsync";


const createCourse = catchAsync(async (req: Request, res: Response) => {
  const courseData = req.body;
  const result = await CourseServices.createCourseIntoDB(courseData);
  
  res.status(status.CREATED).json({
    success: true,
    message: "Course created successfully",
    data: result,
  });
});

export const CourseController = {
  createCourse,
};