import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reviewServices } from "./review.services";


const CreateReview=catchAsync(async(req,res)=>{
    const user=req.user


const userName=`${user?.firstName} ${user.lastName}`

const reviewData={...req.body,userName:userName,userId:user.id}
console.log('check review data',reviewData)
const result=await reviewServices.createReviewForDb(reviewData)

sendResponse(res,{
    statusCode: status.OK,
    success: true,
    message: "reviews successfully created !",
    data: result,
  })
})
const getAllReview=catchAsync(async(req,res)=>{
const result=await reviewServices.getAllReviewForDb()

sendResponse(res,{
    statusCode: status.OK,
    success: true,
    message: "All reviews successfully get !",
    data: result,
  })
})
const getSingleReview=catchAsync(async(req,res)=>{
    const {id}=req.params
const result=await reviewServices.getSingleReviewForDb(id)

sendResponse(res,{
    statusCode: status.OK,
    success: true,
    message: "single review successfully get !",
    data: result,
  })
})
const UpdateReview=catchAsync(async(req,res)=>{
    const {id}=req.params
const result=await reviewServices.updateSingleReviewForDb(id,req.body)

sendResponse(res,{
    statusCode: status.OK,
    success: true,
    message: "reviews successfully updated !",
    data: result,
  })
})
const DeleteReview=catchAsync(async(req,res)=>{
    const {id}=req.params
const result=await reviewServices.deleteReviewForDb(id)

sendResponse(res,{
    statusCode: status.OK,
    success: true,
    message: "reviews successfully deleted !"
  })
})

export const ReviewContllors={
    CreateReview,
    getAllReview,
    getSingleReview,
    UpdateReview,
    DeleteReview
}