import status from "http-status";
import { ICourse } from "./course.interface";
import { Course } from "./course.model";
import AppError from "../../errors/appError";

const createCourseIntoDB = async (payload: ICourse) => {
  const existingCourse = await Course.findOne({
    courseName: payload.courseName,
  });

  if (existingCourse) {
    throw new AppError(
      status.BAD_REQUEST,
      "Course with this name already exists"
    );
  }

  const result = await Course.create(payload);
  return result;
};

export const CourseServices = {
  createCourseIntoDB,
};
