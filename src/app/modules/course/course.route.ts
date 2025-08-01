import { Router } from "express";
import { CourseController } from "./course.controller";

const router = Router();

router.post(
  "/",
//   validateRequest(UserValidation.userValidationSchema),
  CourseController.createCourse
);

export const CourseRoutes = router;
