import { NextFunction } from "express"
import notificationService from "../../common/service/notification.service"
import { redisService } from "../../common/service/redis.service"
import { s3service } from "../../common/service/s3.servics"
import { userRepository } from "../../db/repositry/user repository "
import { createpostdto } from "./post.dto"
import { successresponse } from "../../common/utilis/response.success"
import { AppError } from "../../common/utilis/global-error-handler"
import { Types } from "mongoose"
import { store_enum } from "../../common/enum/multerenum"
import { randomUUID } from "node:crypto"
import { postRepository } from "../../db/repositry/post.repository"
import { id } from "zod/locales"

class postservice{
     private readonly _usermodel = new userRepository()
        private readonly _redisservice = redisService
        private readonly _s3service=new s3service()
        private readonly notificationservice= notificationService
    private readonly _postrepo = new postRepository()


        constructor(){  
        }

createpost=async(req:Request,res:Response,next:NextFunction)=>{
    const { availability, allowcomments,content,tags}:createpostdto=req.body
    let mentions:Types.ObjectId[]=[]
    let fcmtokens:string[]=[]
    if (tags?.length){
        const mentiontags=await this._usermodel.find({
            filter:{
                _id: {$in:tags}
            }
        })
        if 
        (tags.length!=mentiontags.length){
            throw new AppError("invalid tag id")
        }
       for(const tag of mentiontags){
        mentions.push(tag._id);
           (await this._redisservice.getfcms(tag._id)).map((token)=> fcmtokens.push(token))
           }

       }
    let urls:string[]=[]
    let folderid=randomUUID()
    if(req?.files){
        urls=await this._s3service.uploadfiles({
            files:req.files as Express.Multer.File[],
            path:`users/${req?.user?._id}/posts/${folderid}`,
            store_type:store_enum.memory
        })
    }
    const post =await this._postrepo.create({
        attachments:urls,
        content:content!,
        createdby:req?.user?._id!,
        tags:mentions,
        folderid,
        availability,
        allowcomments
    })
    if(!post){
        await this._s3service.deletefiles(urls)
        throw new AppError("fail to create post")
    }
    if (fcmtokens?.length){
        await this.notificationservice.sendnotifications({
            tokens:fcmtokens,
            data:{
                title:`you are mention on new post`,
                body:content||"newpost"
            }
        })
    }
successresponse({res})

        }
}
export default new postservice()