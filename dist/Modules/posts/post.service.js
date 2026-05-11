"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = __importDefault(require("../../common/service/notification.service"));
const redis_service_1 = require("../../common/service/redis.service");
const s3_servics_1 = require("../../common/service/s3.servics");
const user_repository_1 = require("../../db/repositry/user repository ");
const response_success_1 = require("../../common/utilis/response.success");
const global_error_handler_1 = require("../../common/utilis/global-error-handler");
const multerenum_1 = require("../../common/enum/multerenum");
const node_crypto_1 = require("node:crypto");
const post_repository_1 = require("../../db/repositry/post.repository");
class postservice {
    _usermodel = new user_repository_1.userRepository();
    _redisservice = redis_service_1.redisService;
    _s3service = new s3_servics_1.s3service();
    notificationservice = notification_service_1.default;
    _postrepo = new post_repository_1.postRepository();
    constructor() {
    }
    createpost = async (req, res, next) => {
        const { availability, allowcomments, content, tags } = req.body;
        let mentions = [];
        let fcmtokens = [];
        if (tags?.length) {
            const mentiontags = await this._usermodel.find({
                filter: {
                    _id: { $in: tags }
                }
            });
            if (tags.length != mentiontags.length) {
                throw new global_error_handler_1.AppError("invalid tag id");
            }
            for (const tag of mentiontags) {
                mentions.push(tag._id);
                (await this._redisservice.getfcms(tag._id)).map((token) => fcmtokens.push(token));
            }
        }
        let urls = [];
        let folderid = (0, node_crypto_1.randomUUID)();
        if (req?.files) {
            urls = await this._s3service.uploadfiles({
                files: req.files,
                path: `users/${req?.user?._id}/posts/${folderid}`,
                store_type: multerenum_1.store_enum.memory
            });
        }
        const post = await this._postrepo.create({
            attachments: urls,
            content: content,
            createdby: req?.user?._id,
            tags: mentions,
            folderid,
            availability,
            allowcomments
        });
        if (!post) {
            await this._s3service.deletefiles(urls);
            throw new global_error_handler_1.AppError("fail to create post");
        }
        if (fcmtokens?.length) {
            await this.notificationservice.sendnotifications({
                tokens: fcmtokens,
                data: {
                    title: `you are mention on new post`,
                    body: content || "newpost"
                }
            });
        }
        (0, response_success_1.successresponse)({ res });
    };
}
exports.default = new postservice();
