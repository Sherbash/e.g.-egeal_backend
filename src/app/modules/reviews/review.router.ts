
import express from "express"
import { ReviewContllors } from "./review.contllors"
import auth from "../../middleware/auth"
import { UserRole } from "../user/user.interface"

const router=express.Router()

router.post("/",auth(UserRole.USER,UserRole.ADMIN,UserRole.FOUNDER,UserRole.INFLUENCER,UserRole.INVESTOR),ReviewContllors.CreateReview)
router.get("/",ReviewContllors.getAllReview)
router.get("/:id",ReviewContllors.getSingleReview)
router.get("/getTool-reviews/:id",ReviewContllors.GetToolReviews)
router.patch("/:id",ReviewContllors.UpdateReview)
router.delete("/",ReviewContllors.DeleteReview)

export const reviewRouter=router