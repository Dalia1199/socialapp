import { Types } from "mongoose"
import { availability_enum } from "../enum/post.enum"
import { Request } from "express"

export const avaliabilitypost = (req: Request) => {
    return [
        { availability: availability_enum.puplic },  // FIX: puplic kept as original spelling
        {
            availability: availability_enum.friends,
            createdby: { $in: [req.user?._id!, ...(req.user?.friends || [])] }  
        },
        { availability: availability_enum.only_me, createdby: req?.user?._id! }, 
        { tags: { $in: [req?.user?._id!] } }
    ]
}