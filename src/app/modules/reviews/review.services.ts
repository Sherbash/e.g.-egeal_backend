import { IReview } from "./review.interface";
import { ReviewModel } from "./review.model";

const createReviewForDb=async(paylood:IReview)=>{

    const result=await ReviewModel.create(paylood)

return{
    result
}
}
const getAllReviewForDb=async()=>{

    const result=await ReviewModel.find({})

return{
    result
}
}
const getSingleReviewForDb=async(id:string)=>{

    const result=await ReviewModel.findOne({_id:id})

return{
    result
}
}
const updateSingleReviewForDb=async(id:string,paylood:Partial<IReview>)=>{

    const result=await ReviewModel.findOneAndUpdate({_id:id},{
        $set:paylood,
        
    },
{new:true,runValidators:true})

return{
    result
}
}

const deleteReviewForDb=async(id:string)=>{

    const result=await ReviewModel.deleteOne({_id:id})

return{
    result
}
}


export const reviewServices={
    createReviewForDb,
    getAllReviewForDb,
    getSingleReviewForDb,
    updateSingleReviewForDb,
    deleteReviewForDb
}