import { Types } from "mongoose"
import { availability_enum } from "../enum/post.enum.js"
import { Request } from "express"

export const avaliabilitypost=(req:Request)=>{
    return {
        $or:[
             {availability: availability_enum.public },
             {availability:availability_enum.friends,createdby:{$in:[req.user?._id!,...(req.user?.friends||[])!}},
             {avalability:availability_enum.onlyme,createdby:req?.user?._id!},
             {tags:{$in:[req?.user?._id!]}}
        ]
    }
}