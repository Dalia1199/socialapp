import { NextFunction, Request, Response } from "express"
import notificationService from "../../common/service/notification.service"
import  redisService  from "../../common/service/redis.service"
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
import { Ipost } from "../../db/models/postmodel"

class commentservice{
     private readonly _usermodel = new userRepository()
        private readonly _redisservice = redisService
        private readonly _s3service=new s3service()
        private readonly notificationservice= notificationService
        private readonly _commentrepo = new commentRepository()
        private readonly _postrepo = new postRepository()


        constructor(){  
        }



    createcomment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { content, tags, onmodel }: createcommentdto = req.body
            const { postid, commentid } = req.params

            let doc: HydratedDocument<Ipost | Icomment> | null = null

            // comment on post
            if (onmodel === onmodel_enum.post && !commentid) {
                doc = await this._postrepo.findOne({
                    filter: {
                        _id: postid,
                        $or: [...avaliabilitypost(req)],
                        allowcomment: allow_comment_enum.allow
                    }
                })
            }

            // reply on comment
            else if (
                onmodel === onmodel_enum.comment &&
                commentid
            ) {
                const comment = await this._commentrepo.findOne({
                    filter: {
                        _id: commentid,
                        refId: postid
                    },
                    options: {
                        populate: [
                            {
                                path: "refId",
                                match: {
                                    $or: [...avaliabilitypost(req)],
                                    allowcomment: allow_comment_enum.allow
                                }
                            }
                        ]
                    }
                })

                if (!comment?.refId) {
                    throw new AppError(
                        "comment not found or you are not allowed to comment on this post",
                        404
                    )
                }

                doc = comment
            }

            if (!doc) {
                throw new AppError("invalid onmodel", 400)
            }

            // tags
            let mentions: Types.ObjectId[] = []
            let fcmtokens: string[] = []

            if (tags?.length) {
                const data = await this._usermodel.find({
                    filter: {
                        _id: { $in: tags }
                    }
                })

                if (data.length !== tags.length) {
                    throw new AppError("some tag id not found")
                }

                for (const tag of data) {
                    if (
                        tag?._id?.toString() ===
                        req?.user?._id.toString()
                    ) {
                        throw new AppError(
                            "you can not mention yourself"
                        )
                    }

                    mentions.push(tag._id)

                    const token =
                        await this._redisservice.getfcms(tag._id)

                    fcmtokens.push(...token)
                }
            }

            // upload files
            const folderid = randomUUID()
            let urls: string[] = []

            if (req.files?.length) {
                urls =
                    await this._s3service.uploadfiles({
                        files:
                            req.files as Express.Multer.File[],
                        path: `users/${req.user?._id}/posts/${doc.folderid}/comments/${folderid}`,
                        store_type: store_enum.memory
                    })
            }

            const comment =
                await this._commentrepo.create({
                    attachments: urls,
                    content: content || "",
                    createdby: req.user?._id!,
                    folderid,
                    tags: mentions,
                    refId: doc._id
                })

            if (!comment) {
                await this._s3service.deletefiles(urls)

                throw new AppError(
                    "fail to create comment",
                    500
                )
            }

            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications({
                    tokens: fcmtokens,
                    data: {
                        title: "you have new mention",
                        body:
                            comment.content || "new mention"
                    }
                })
            }

            successresponse({
                res,
                data: comment
            })
        } catch (error) {
            next(error)
        }
    }
    createreply = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { content, tags }: createcommentdto = req.body
            const { postid, commentid } = req.params

            const parentcomment =
                await this._commentrepo.find({
                    filter: {
                        _id: commentid,
                        postid: postid
                    },
                    options: {
                        populate: [
                            {
                                path: "postid",
                                match: {
                                    $or: [
                                        ...avaliabilitypost(req)
                                    ],
                                    allowcomment:
                                        allow_comment_enum.allow
                                }
                            }
                        ]
                    }
                })

            if (!parentcomment?.postid) {
                throw new AppError(
                    "comment not found or you are not allowed to comment on this post",
                    404
                )
            }

            let mentions: Types.ObjectId[] = []
            let fcmtokens: string[] = []

            if (tags?.length) {
                const data =
                    await this._usermodel.find({
                        filter: {
                            _id: { $in: tags }
                        }
                    })

                if (data.length !== tags.length) {
                    throw new AppError(
                        "some tag id not found"
                    )
                }

                for (const tag of data) {
                    if (
                        tag._id.toString() ===
                        req.user?._id.toString()
                    ) {
                        throw new AppError(
                            "you can not mention yourself"
                        )
                    }

                    mentions.push(tag._id)

                    const token =
                        await this._redisservice.getfcms(
                            tag._id
                        )

                    fcmtokens.push(...token)
                }
            }

            const folderid = randomUUID()
            let urls: string[] = []

            if (req.files?.length) {
                urls =
                    await this._s3service.uploadfiles({
                        files:
                            req.files as Express.Multer.File[],
                        path: `users/${req.user?._id}/posts/${(parentcomment.refId as any).folderid}/comments/${folderid}`,
                        store_type:
                            store_enum.memory
                    })
            }

            const reply =
                await this._commentrepo.create({
                    attachments: urls,
                    content: content || "",
                    createdby: req.user?._id!,
                    folderid,
                    tags: mentions,
                    refId: post,
                    commentid: commentid
                })

            if (!reply) {
                await this._s3service.deletefiles(
                    urls
                )

                throw new AppError(
                    "fail to create reply",
                    500
                )
            }

            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications(
                    {
                        tokens: fcmtokens,
                        data: {
                            title:
                                "you have new mention",
                            body:
                                reply.content ||
                                "new mention"
                        }
                    }
                )
            }

            successresponse({
                res,
                data: reply
            })
        } catch (error) {
            next(error)
        }
    }
    updatecomment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { commentid, postid } = req.params
            const { content, tags, removetags, removefiles } = req.body

            const comment = await this._commentrepo.findOne({
                filter: { _id: commentid, createdby: req.user._id, isdeleted: { $ne: true } } as any
            })
            if (!comment) throw new AppError("comment not found or not authorized", 404)

            if (removefiles?.length) {
                const invalid = removefiles.filter((f: string) => !comment.attachments?.includes(f))
                if (invalid.length) throw new AppError("some files you want to remove do not exist")
                await this._s3service.deletefiles(removefiles)
                comment.attachments = comment.attachments?.filter((f: string) => !removefiles.includes(f))
            }

            const updatetags = new Set(comment?.tags?.map(id => id.toString()))
            removetags?.forEach((tag: string) => updatetags.delete(tag))

            let fcmtokens: string[] = []
            if (tags?.length) {
                const data = await this._usermodel.find({ filter: { _id: { $in: tags } } })
                if (data.length !== tags.length) throw new AppError("some tag id not found")
                for (const tag of data) {
                    if (tag._id.toString() == req.user._id.toString()) throw new AppError("you cannot mention yourself")
                    updatetags.add(tag._id.toString())
                    const tokens = await this._redisservice.getfcms(tag._id)
                    fcmtokens.push(...tokens)
                }
            }

            comment.tags = [...updatetags].map(id => new Types.ObjectId(id))

            if (req?.files) {
                const newurls = await this._s3service.uploadfiles({
                    files: req.files as Express.Multer.File[],
                    path: `users/${req.user._id}/posts/${postid}/comments/${comment.folderid}`,
                    store_type: store_enum.memory
                })
                comment.attachments?.push(...newurls)
            }

            if (content) comment.content = content
            await comment.save()

            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications({ tokens: fcmtokens, data: { title: "you are mentioned in a comment", body: content || "comment updated" } })
            }
            successresponse({ res, message: "comment updated" })
        } catch (error) { next(error) }
    }

    softdeletecomment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { commentid } = req.params
            const comment = await this._commentrepo.findoneAndUpdate({
                filter: { _id: commentid, createdby: req.user._id, isdeleted: { $ne: true } } as any,
                update: { isdeleted: true }
            })
            if (!comment) throw new AppError("comment not found or not authorized", 404)
            successresponse({ res, message: "comment deleted" })
        } catch (error) { next(error) }
    }

    harddeletecomment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { commentid, postid } = req.params
            const comment = await this._commentrepo.findOne({ filter: { _id: commentid, createdby: req.user._id } as any })
            if (!comment) throw new AppError("comment not found or not authorized", 404)
            if (comment.folderid) {
                await this._s3service.deletefolder(`users/${req.user._id}/posts/${postid}/comments/${comment.folderid}`)
            }
            await this._commentrepo.findOneAndDelete({ filter: { _id: commentid } as any })
            successresponse({ res, message: "comment permanently deleted" })
        } catch (error) { next(error) }
    }

    reactcomment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { commentid } = req.params
            const { type } = req.body
            const userid = req.user._id

            const comment = await this._commentrepo.findOne({ filter: { _id: commentid, isdeleted: { $ne: true } } as any })
            if (!comment) throw new AppError("comment not found", 404)

            await this._commentrepo.findoneAndUpdate({
                filter: { _id: commentid } as any,
                update: { $pull: { reactions: { userid } } }
            })

            if (type && Object.values(reaction_enum).includes(type)) {
                await this._commentrepo.findoneAndUpdate({
                    filter: { _id: commentid } as any,
                    update: { $addToSet: { reactions: { userid, type } } }
                })
            }
            successresponse({ res, message: "reaction updated" })
        } catch (error) { next(error) }
    }

   // get comments for a post
    getcomments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { postid } = req.params
            const result = await this._commentrepo.paginate({
                page: +req?.query?.page! || 1,
                limit: +req?.query?.limit! || 10,
                sort: { createdAt: -1 },
                populate: [
                    { path: "createdby", select: "fname lname profilepic" },
                    { path: "tags", select: "fname lname profilepic" },
                    { path: "replies", match: { isdeleted: { $ne: true } }, populate: [{ path: "createdby", select: "fname lname profilepic" }] }
                ],
                search: { refId: new Types.ObjectId(postid), onmodel: onmodel_enum.post, isdeleted: { $ne: true } } as any
            })
            successresponse({ res, data: result })
        } catch (error) { next(error) }
    }
}

    export default new commentservice()