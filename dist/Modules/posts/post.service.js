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
const mongoose_1 = require("mongoose");
const multerenum_1 = require("../../common/enum/multerenum");
const node_crypto_1 = require("node:crypto");
const post_repository_1 = require("../../db/repositry/post.repository");
const avaliabilityposts_1 = require("../../common/utilis/avaliabilityposts");
class postservice {
    _usermodel = new user_repository_1.userRepository();
    _redisservice = redis_service_1.default;
    _s3service = new s3_servics_1.s3service();
    notificationservice = notification_service_1.default;
    _postrepo = new post_repository_1.postRepository();
    constructor() { }
    createpost = async (req, res, next) => {
        try {
            const { availability, allowcomment, content, tags } = req.body;
            let mentions = [];
            let fcmtokens = [];
            if (tags?.length) {
                const mentiontags = await this._usermodel.find({ filter: { _id: { $in: tags } } });
                if (tags.length != mentiontags.length)
                    throw new global_error_handler_1.AppError("invalid tag id");
                for (const tag of mentiontags) {
                    mentions.push(tag._id);
                    (await this._redisservice.getfcms(tag._id)).map((token) => fcmtokens.push(token));
                }
            }
            let urls = [];
            const folderid = (0, node_crypto_1.randomUUID)();
            if (req?.files) {
                urls = await this._s3service.uploadfiles({ files: req.files, path: `users/${req?.user?._id}/posts/${folderid}`, store_type: multerenum_1.store_enum.memory });
            }
            const post = await this._postrepo.create({ attachments: urls, content: content, createdby: req?.user?._id, tags: mentions, folderid, availability, allowcomment });
            if (!post) {
                await this._s3service.deletefiles(urls);
                throw new global_error_handler_1.AppError("fail to create post");
            }
            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications({ tokens: fcmtokens, data: { title: `you are mentioned on a new post`, body: content || "newpost" } });
            }
            (0, response_success_1.successresponse)({ res, data: post });
        }
        catch (error) {
            next(error);
        }
    };
    getposts = async (req, res, next) => {
        const searchquery = req.query?.search ? { content: { $regex: req.query.search, $options: "i" } } : {};
        const paginate = await this._postrepo.paginate({
            page: +req?.query?.page,
            limit: +req?.query?.limit,
            search: {
                $or: [
                    (0, avaliabilityposts_1.avaliabilitypost)(req)
                ],
                ...searchquery
            }
        });
        const posts = await this._postrepo.find({
            filter: {
                $or: [
                    (0, avaliabilityposts_1.avaliabilitypost)(req)
                ]
            },
            options: { populate: [{
                        path: "comments",
                        match: {
                            commentid: { $exists: false }
                        },
                        populate: [{
                                path: "replies"
                            }]
                    }] }
        });
        (0, response_success_1.successresponse)({ res, data: posts });
    };
    likepost = async (req, res, next) => {
        const { postid } = req.params;
        const { flag } = req.query;
        let updatequery = {
            $addToSet: { likes: req.user?._id }
        };
        if (flag && flag === "dislike") {
            updatequery = {
                $pull: { likes: req.user?._id }
            };
        }
        const post = await this._postrepo.findoneAndUpdate({
            filter: {
                _id: postid,
                ...(0, avaliabilityposts_1.avaliabilitypost)(req),
            },
            update: updatequery
        });
        if (!post) {
            throw new global_error_handler_1.AppError("POST NOT FOUND OR NOT AUTHORIZED");
        }
        (0, response_success_1.successresponse)({ res, data: post });
    };
    updatepost = async (req, res, next) => {
        try {
            const { postid } = req.params;
            const { content, availability, allowcomment, tags, removetags, removefiles } = req.body;
            const post = await this._postrepo.findOne({
                filter: { _id: postid, createdby: req?.user?._id }
            });
            if (!post) {
                throw new global_error_handler_1.AppError("post not found or not authorized");
            }
            if (removefiles?.length) {
                const invalidfiles = removefiles.filter((file) => {
                    return !post.attachments?.includes(file);
                });
                if (invalidfiles?.length) {
                    throw new global_error_handler_1.AppError("some of path file you want remove not exist");
                }
                await this._s3service.deletefiles(removefiles);
                post.attachments = post.attachments?.filter((file) => {
                    return !removefiles.includes(file);
                });
            }
            const updatetags = new Set(post?.tags?.map(id => id.toString()));
            removetags?.forEach((tag) => {
                return updatetags.delete(tag);
            });
            let fcmtokens = [];
            if (tags?.length) {
                const mentiontags = await this._usermodel.find({
                    filter: { _id: { $in: tags } }
                });
                if (tags.length != mentiontags.length) {
                    throw new global_error_handler_1.AppError("invalid tag id");
                }
                for (const tag of mentiontags) {
                    if (tag._id.toString() == req.user?._id.toString()) {
                        throw new global_error_handler_1.AppError("you cannot mention yourself");
                    }
                    updatetags.add(tag._id.toString());
                    (await this._redisservice.getfcms(tag._id)).map((token) => { fcmtokens.push(token); });
                    const tokens = await this._redisservice.getfcms(tag._id);
                    if (tokens?.length) {
                        tokens.map((token) => fcmtokens.push(token));
                    }
                }
            }
            post.tags = [...updatetags].map((id) => new mongoose_1.Types.ObjectId(id));
            let urls = [];
            let folderid = (0, node_crypto_1.randomUUID)();
            if (req?.files) {
                let urls = await this._s3service.uploadfiles({
                    files: req.files,
                    path: `users/${req?.user?._id}/posts/${post.folderid}`,
                    store_type: multerenum_1.store_enum.memory
                });
                post.attachments?.push(...urls);
            }
            if (content)
                post.content = content;
            if (availability)
                post.availability = availability;
            if (allowcomment)
                post.allowcomment = allowcomment;
            await post.save();
            if (fcmtokens?.length) {
                await this.notificationservice.sendnotifications({ tokens: fcmtokens, data: { title: `you are mentioned on a post`, body: content || "post updated" } });
            }
            (0, response_success_1.successresponse)({ res });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = new postservice();
//# sourceMappingURL=post.service.js.map