import express from "express";
import { CommentControllers } from "./comment.contllors";
import { UserRole } from "../user/user.interface";
import auth from "../../middleware/auth";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  CommentControllers.CreateComment
);

router.get("/get-entity-comments/:entityId", CommentControllers.GetAllCommentsByEntityId);

router.get("/:id", CommentControllers.GetSingleComment);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  CommentControllers.UpdateComment
);

router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  CommentControllers.DeleteComment
);

export const CommentRoutes = router;
