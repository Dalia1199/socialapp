"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = __importDefault(require("../../common/service/notification.service"));
const redis_service_1 = __importDefault(require("../../common/service/redis.service"));
const s3_servics_1 = require("../../common/service/s3.servics");
const user_repository_1 = require("../../db/repositry/user repository ");
const response_success_1 = require("../../common/utilis/response.success");
const global_error_handler_1 = require("../../common/utilis/global-error-handler");
const multerenum_1 = require("../../common/enum/multerenum");
const node_crypto_1 = require("node:crypto");
const commentrepository_1 = require("../../db/repositry/commentrepository");
const post_repository_1 = require("../../db/repositry/post.repository");
const avaliabilityposts_1 = require("../../common/utilis/avaliabilityposts");
const post_enum_1 = require("../../common/enum/post.enum");
class commentservice {
    _usermodel = new user_repository_1.userRepository();
    _redisservice = redis_service_1.default;
    _s3service = new s3_servics_1.s3service();
    notificationservice = notification_service_1.default;
    _commentrepo = new commentrepository_1.commentRepository();
    _postrepo = new post_repository_1.postRepository();
    constructor() {
    }
    createcomment = async (req, res, next) => {
        try {
            const { content, tags, onmodel } = req.body;
            const { postid, commentid } = req.params;
            let doc = null;
            // comment on post
            if (onmodel === post_enum_1.onmodel_enum.post && !commentid) {
                doc = await this._postrepo.findOne({
                    filter: {
                        _id: postid,
                        $or: [...(0, avaliabilityposts_1.avaliabilitypost)(req)],
                        allowcomment: post_enum_1.allow_comment_enum.allow
                    }
                });
            }
            // reply on comment
            else if (onmodel === post_enum_1.onmodel_enum.comment &&
                commentid) {
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
                                    $or: [...(0, avaliabilityposts_1.avaliabilitypost)(req)],
                                    allowcomment: post_enum_1.allow_comment_enum.allow
                                }
                            }
                        ]
                    }
                });
                if (!comment?.refId) {
                    throw new global_error_handler_1.AppError("comment not found or you are not allowed to comment on this post", 404);
                }
                doc = comment;
            }
            if (!doc) {
                throw new global_error_handler_1.AppError("invalid onmodel", 400);
            }
            // tags
            let mentions = [];
            let fcmtokens = [];
            if (tags?.length) {
                const data = await this._usermodel.find({
                    filter: {
                        _id: { $in: tags }
                    }
                });
                if (data.length !== tags.length) {
                    throw new global_error_handler_1.AppError("some tag id not found");
                }
                for (const tag of data) {
                    if (tag?._id?.toString() ===
                        req?.user?._id.toString()) {
                        throw new global_error_handler_1.AppError("you can not mention yourself");
                    }
                    mentions.push(tag._id);
                    const token = await this._redisservice.getfcms(tag._id);
                    fcmtokens.push(...token);
                }
            }
            // upload files
            const folderid = (0, node_crypto_1.randomUUID)();
            let urls = [];
            if (req.files?.length) {
                urls =
                    await this._s3service.uploadfiles({
                        files: req.files,
                        path: `users/${req.user?._id}/posts/${doc.folderid}/comments/${folderid}`,
                        store_type: multerenum_1.store_enum.memory
                    });
            }
            const comment = await this._commentrepo.create({
                attachments: urls,
                content: content || "",
                createdby: req.user?._id,
                folderid,
                tags: mentions,
                refId: doc._id
            });
            if (!comment) {
                await this._s3service.deletefiles(urls);
                throw new global_error_handler_1.AppError("fail to create comment", 500);
            }
            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications({
                    tokens: fcmtokens,
                    data: {
                        title: "you have new mention",
                        body: comment.content || "new mention"
                    }
                });
            }
            (0, response_success_1.successresponse)({
                res,
                data: comment
            });
        }
        catch (error) {
            next(error);
        }
    };
    createreply = async (req, res, next) => {
        try {
            const { content, tags } = req.body;
            const { postid, commentid } = req.params;
            const parentcomment = await this._commentrepo.find({
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
                                    ...(0, avaliabilityposts_1.avaliabilitypost)(req)
                                ],
                                allowcomment: post_enum_1.allow_comment_enum.allow
                            }
                        }
                    ]
                }
            });
            if (!parentcomment?.postid) {
                throw new global_error_handler_1.AppError("comment not found or you are not allowed to comment on this post", 404);
            }
            let mentions = [];
            let fcmtokens = [];
            if (tags?.length) {
                const data = await this._usermodel.find({
                    filter: {
                        _id: { $in: tags }
                    }
                });
                if (data.length !== tags.length) {
                    throw new global_error_handler_1.AppError("some tag id not found");
                }
                for (const tag of data) {
                    if (tag._id.toString() ===
                        req.user?._id.toString()) {
                        throw new global_error_handler_1.AppError("you can not mention yourself");
                    }
                    mentions.push(tag._id);
                    const token = await this._redisservice.getfcms(tag._id);
                    fcmtokens.push(...token);
                }
            }
            const folderid = (0, node_crypto_1.randomUUID)();
            let urls = [];
            if (req.files?.length) {
                urls =
                    await this._s3service.uploadfiles({
                        files: req.files,
                        path: `users/${req.user?._id}/posts/${parentcomment.refId.folderid}/comments/${folderid}`,
                        store_type: multerenum_1.store_enum.memory
                    });
            }
            const reply = await this._commentrepo.create({
                attachments: urls,
                content: content || "",
                createdby: req.user?._id,
                folderid,
                tags: mentions,
                refId: post,
                commentid: commentid
            });
            if (!reply) {
                await this._s3service.deletefiles(urls);
                throw new global_error_handler_1.AppError("fail to create reply", 500);
            }
            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications({
                    tokens: fcmtokens,
                    data: {
                        title: "you have new mention",
                        body: reply.content ||
                            "new mention"
                    }
                });
            }
            (0, response_success_1.successresponse)({
                res,
                data: reply
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = commentservice;
//# sourceMappingURL=comments.service.js.map