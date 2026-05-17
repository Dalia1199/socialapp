import { NextFunction, Request, Response } from "express"
import notificationService from "../../common/service/notification.service"
import  redisService  from "../../common/service/redis.service"
import { s3service } from "../../common/service/s3.servics"
import { userRepository } from "../../db/repositry/user repository "
import { createpostdto, updatepostdto } from "./post.dto"
import { successresponse } from "../../common/utilis/response.success"
import { AppError } from "../../common/utilis/global-error-handler"
import { Types } from "mongoose"
import { store_enum } from "../../common/enum/multerenum"
import { randomUUID } from "node:crypto"
import { postRepository } from "../../db/repositry/post.repository"
import { avaliabilitypost } from "../../common/utilis/avaliabilityposts"

class postservice{
     private readonly _usermodel = new userRepository()
        private readonly _redisservice = redisService
        private readonly _s3service=new s3service()
        private readonly notificationservice= notificationService
    private readonly _postrepo = new postRepository()


        constructor(){}

    createpost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { availability, allowcomment, content, tags }: createpostdto = req.body
            let mentions: Types.ObjectId[] = []
            let fcmtokens: string[] = []
            if (tags?.length) {
                const mentiontags = await this._usermodel.find({ filter: { _id: { $in: tags } } })
                if (tags.length != mentiontags.length) throw new AppError("invalid tag id")
                for (const tag of mentiontags) {
                    mentions.push(tag._id);
                    (await this._redisservice.getfcms(tag._id)).map((token) => fcmtokens.push(token))
                }
            }
            let urls: string[] = []
            const folderid = randomUUID()
            if (req?.files) {
                urls = await this._s3service.uploadfiles({ files: req.files as Express.Multer.File[], path: `users/${req?.user?._id}/posts/${folderid}`, store_type: store_enum.memory })
            }
            const post = await this._postrepo.create({ attachments: urls, content: content!, createdby: req?.user?._id!, tags: mentions, folderid, availability, allowcomment })
            if (!post) {
                await this._s3service.deletefiles(urls)
                throw new AppError("fail to create post")
            }
            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications({ tokens: fcmtokens, data: { title: `you are mentioned on a new post`, body: content || "newpost" } })
            }
            successresponse({ res, data: post })
        } catch (error) { next(error) }
    }

getposts=async(req:Request,res:Response,next:NextFunction)=>{
    const searchquery=req.query?.search?{content :{$regex:req.query.search,$options:"i"}}:{}
            const paginate=await this._postrepo.paginate({
                page:+req?.query?.page!,
                limit:+req?.query?.limit!,
                search:{
                    $or:[
                        avaliabilitypost(req)
                    ],
                    ...searchquery}})
                    const posts=await this._postrepo.find({
                        filter:{
                            $or:[
                                avaliabilitypost(req)
                            ]
                        },
                        options:{populate:
                        [{
                        path:"comments",
                        match:{
                            commentid:{$exists:false}
                        },
                        populate:[{
                            path:"replies"
                        }]

                        
                        }]}
                    })
                   
                    
                    successresponse({res,data:posts})

        }
    likepost = async (req: Request, res: Response, next: NextFunction)=>{
        const {postid}=req.params
        const {flag}=req.query
        let updatequery:any={
            $addToSet:{likes:req.user?._id}
        }
        if(flag&&flag==="dislike"){
            updatequery={
                $pull:{likes:req.user?._id}
            }
        }
        const post =await this._postrepo.findoneAndUpdate({
            filter:{
                _id:postid,

                ...avaliabilitypost(req),
            },
            update:updatequery
        })
        if (!post){
            throw new AppError("POST NOT FOUND OR NOT AUTHORIZED")
        }
        successresponse({res,data:post})
    }
    updatepost = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { postid } = req.params 
            const { content, availability, allowcomment, tags, removetags,removefiles }:updatepostdto = req.body

            const post = await this._postrepo.findOne({
                filter: { _id: postid, createdby: req?.user?._id! }
            })

            if (!post) {
                throw new AppError("post not found or not authorized")
            }
            if(removefiles?.length){
                const invalidfiles=removefiles.filter((file:string)=>{
             return !post.attachments?.includes(file)
                })
                if(invalidfiles?.length){
                    throw new AppError("some of path file you want remove not exist")
                }
                await this._s3service.deletefiles(removefiles)
                post.attachments=post.attachments?.filter((file:string)=>{
                    return !removefiles.includes(file)
                }) as string[]
            }
            const updatetags=new Set(post?.tags?.map(id=>id.toString()))
            removetags?.forEach((tag:string)=>{
                return updatetags.delete(tag)
            })

            let fcmtokens: string[] = []

            if (tags?.length) {
                const mentiontags = await this._usermodel.find({
                    filter: { _id: { $in: tags } }
                })

                if (tags.length != mentiontags.length) {
                    throw new AppError("invalid tag id")
                }

                for (const tag of mentiontags) {
                  if(tag._id.toString()==req.user?._id.toString()){
                    throw new AppError("you cannot mention yourself")
                  }
                  updatetags.add(tag._id.toString());
                  (await this._redisservice.getfcms(tag._id)).map((token:string)=>{fcmtokens.push(token)})

                    const tokens = await this._redisservice.getfcms(tag._id)
                    if (tokens?.length) {
                        tokens.map((token: string) => fcmtokens.push(token))
                    }
                }
            }
            post.tags = [...updatetags].map((id: string) => new Types.ObjectId(id))

            let urls: string[] = []
            let folderid = randomUUID()
            if (req?.files) {
                 let urls = await this._s3service.uploadfiles({
                    files: req.files as Express.Multer.File[],
                    path: `users/${req?.user?._id}/posts/${post.folderid}`,
                    store_type: store_enum.memory
                })
                post.attachments?.push(...urls)
            }
          
            if (content) post.content = content
            if (availability) post.availability = availability
            if (allowcomment) post.allowcomment = allowcomment

            await post.save()

            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications({ tokens: fcmtokens, data: { title: `you are mentioned on a post`, body: content || "post updated" } })
            }
            successresponse({ res })
    
        }     catch(error) { next(error) } 

    }

    

    getprofileposts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userid } = req.params
            const result = await this._postrepo.paginate({
                page: +req?.query?.page! || 1,
                limit: +req?.query?.limit! || 10,
                sort: { createdAt: -1 },
                populate: [{ path: "createdby", select: "fname lname profilepic" }],
                search: {
                    createdby: new Types.ObjectId(userid),
                    isdeleted: { $ne: true },
                    $or: avaliabilitypost(req)
                } as any
            })
            successresponse({ res, data: result })
        } catch (error) { next(error) }
    }
    reactpost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { postid } = req.params
            const { type } = req.body
            const userid = req.user._id

            const post = await this._postrepo.findOne({ filter: { _id: postid, isdeleted: { $ne: true }, $or: avaliabilitypost(req) } as any })
            if (!post) throw new AppError("post not found", 404)

            await this._postrepo.findoneAndUpdate({
                filter: { _id: postid } as any,
                update: { $pull: { reactions: { userid } } }
            })

            if (type && Object.values(reaction_enum).includes(type)) {
                // Add new reaction
                await this._postrepo.findoneAndUpdate({
                    filter: { _id: postid } as any,
                    update: { $addToSet: { reactions: { userid, type } } }
                })
            }
            successresponse({ res, message: "reaction updated" })
        } catch (error) { next(error) }
    }
    softdeletepost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { postid } = req.params
            const post = await this._postrepo.findoneAndUpdate({
                filter: { _id: postid, createdby: req.user._id, isdeleted: { $ne: true } } as any,
                update: { isdeleted: true }
            })
            if (!post) throw new AppError("post not found or not authorized", 404)
            successresponse({ res, message: "post deleted" })
        } catch (error) { next(error) }
    }

    harddeletepost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { postid } = req.params
            const post = await this._postrepo.findOne({ filter: { _id: postid, createdby: req.user._id } as any })
            if (!post) throw new AppError("post not found or not authorized", 404)
            if (post.folderid) {
                await this._s3service.deletefolder(`users/${req.user._id}/posts/${post.folderid}`)
            }
            await this._postrepo.findOneAndDelete({ filter: { _id: postid } as any })
            successresponse({ res, message: "post permanently deleted" })
        } catch (error) { next(error) }
    }

    dashboard = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit, search } = req.query
            const searchquery = search ? { content: { $regex: search, $options: "i" } } : {}
            const result = await this._postrepo.paginate({
                page: +page! || 1,
                limit: +limit! || 20,
                sort: { createdAt: -1 },
                populate: [{ path: "createdby", select: "fname lname email profilepic" }],
                search: { ...searchquery } as any
            })
            successresponse({ res, data: result })
        } catch (error) { next(error) }
    }
}
export default new postservice()