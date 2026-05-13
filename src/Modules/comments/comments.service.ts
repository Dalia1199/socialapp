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
}
    export default commentservice