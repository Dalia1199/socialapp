import { NextFunction, Request, Response } from "express"
import notificationService from "../../common/service/notification.service"
import { redisService } from "../../common/service/redis.service"
import { s3service } from "../../common/service/s3.servics"
import { userRepository } from "../../db/repositry/user repository "
import { createcommentdto } from "./comments.dto"
import { successresponse } from "../../common/utilis/response.success"
import { AppError } from "../../common/utilis/global-error-handler"
import { HydratedDocument, Types } from "mongoose"
import { store_enum } from "../../common/enum/multerenum"
import { randomUUID } from "node:crypto"
import { file } from "zod"
import { commentRepository } from "../../db/repositry/commentrepository"
import { postRepository } from "../../db/repositry/post.repository"
import { avaliabilitypost } from "../../common/utilis/avaliabilityposts"
import { allow_comment_enum, onmodel_enum } from "../../common/enum/post.enum"
import { Icomment } from "../../db/models/commenstmodel"

class commentservice{
     private readonly _usermodel = new userRepository()
        private readonly _redisservice = redisService
        private readonly _s3service=new s3service()
        private readonly notificationservice= notificationService
        private readonly _commentrepo = new commentRepository()
        private readonly _postrepo = new postRepository()


        constructor(){  
        }



    createcomment = async (req: Request, res: Response, next: NextFunction)=>{
    const{content,tags,onmodel}:createcommentdto=req.body
    const{postid,commentid}=req.params
    let doc:HydratedDocument<Ipost|Icomment>null=null
    if(onmodel===onmodel_enum.post&&!commentid){
    doc=await this._postrepo.findOne({
        filter:{
            _id:postid,
           
            $or:[
                ...avaliabilitypost(req)
            ],
            aloowcomment:allow_comment_enum.allow
        }
    })}else if (onmodel===onmodel_enum&&commentid{
       let comment = await this._commentrepo.findOne({
            filter: {
                _id: commentid,
                refId: postid!,
            },
            options: {
                populate: [
                    {
                        path: "refId",
                        match: {
                            $or: [
                                ...postavalibility(req)
                            ],
                            allowcomment: allowc0mment_enum.allow
                        }
                    }
                ]
            }
        })
        if (!comment?.refId) {
            throw new AppError("tcomment not found or you are not allowed to comment on this post", 404)
        }
        doc=comment

    })
    if (!post){
        throw new AppError("post not found or you are not allowed to comment on this post",404)
    }
    this.if(!doc){
        throw new AppError("invald onmodel",400)
    }
    let mentions:Types.ObjectId[]=[]
    let fcmtokens:string[]=[]
    if(tags?.length){
        _id:{$in:tags}
    }
})
if(data.length!==tags.length){
    throw new AppError("some tag id notfound")
}

for (const tag of data){
if(tag?._id?.toString()==req?.user?._id.toString()){
    throw new AppError("you can not mention to your self")
}
mentions.push(tag._id)
const token =await._redisservice.getfcms(tag._id)
fcmtokens.push(...token)
}}
const folderid=randomUUID()
let urls:string[]=[];
if(req.files?.length){
    urls=await this._s3service.uploadfiles({
        files:req.files as Express.Multer.file[],
        path:`users/${req?.user?._id}/posts/${doc.folderid}/comments/${folderid}`,
        store_type:store_enum.memory
    })
}
const comment=await this._commentrepo.create({
    attachments:urls,
    content:content||"",
    createdby:req.user?.id!,
    folderid,
    tags:mentions,
    refId:doc._id?
})

if(!comment){
    await this._s3service.deletefiles(urls)
    throw new AppError("fail to create comment",500)
}
if (fcmtokens?.length){
    await this._notificationservice.sendnotifications({
        tokens:fcmtokens,
        data:{
            title:"you have new mention",
            body:`${comment.content||"newmention"}`
        }
    })
successresponse({res,data:comment})
}
createreply=async(req:Request,res:Response,next:NextFunction)=>{
    const{content,tags}:createcommentdto=req.body
    const{postid,commentid}=req.params
    const comment=await this._commentrepo.findOne({
        filter:{
            _id:commentid,
            postid:postid!,
        },
        options:{
            populate:[
                {path:"postid",
                    match:{$or:[
                        ...postavalibility(req)
                    ],
                allowcomment:allowc0mment_enum.allow}
                }
            ]
        }
    })
    if(!comment?.postid){
        throw new AppError("tcomment not found or you are not allowed to comment on this post",404)
    }
}
    let mentions: Types.ObjectId[] = []
    let fcmtokens: string[] = []
    if (tags?.length) {
        _id: { $in: tags }
    }
})
if (data.length !== tags.length) {
    throw new AppError("some tag id notfound")
}

for (const tag of data) {
    if (tag?._id?.toString() == req?.user?._id.toString()) {
        throw new AppError("you can not mention to your self")
    }
    mentions.push(tag._id)
    const token = await._redisservice.getfcms(tag._id)
    fcmtokens.push(...token)
}}
const folderid = randomUUID()
let urls: string[] = [];
if (req.files?.length) {
    urls = await this._s3service.uploadfiles({
        files: req.files as Express.Multer.file[],
        path: `users/${req?.user?._id}/posts/${(comment.postid as any ).folderid}/comments/${folderid}`,
        store_type: store_enum.memory
    })
}
const comment = await this._commentrepo.create({
    attachments: urls,
    content: content || "",
    createdby: req.user?.id!,
    folderid,
    tags: mentions,
    postid: comment.post._id,
    commentid:comment._id
})

if (!comment) {
    await this._s3service.deletefiles(urls)
    throw new AppError("fail to create comment", 500)
}
if (fcmtokens?.length) {
    await this._notificationservice.sendnotifications({
        tokens: fcmtokens,
        data: {
            title: "you have new mention",
            body: `${comment.content || "newmention"}`
        }
    })
    successresponse({ res, data: reply })

}
    export default commentservice