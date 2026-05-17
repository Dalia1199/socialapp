"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const multerenum_1 = require("../../common/enum/multerenum");
const response_success_1 = require("../../common/utilis/response.success");
const s3_servics_1 = require("../../common/service/s3.servics");
const notification_service_1 = __importDefault(require("../../common/service/notification.service"));
const user_repository_1 = require("../../db/repositry/user repository ");
class storyservice {
    _usermodel = new user_repository_1.userRepository();
    _redisservice = redisService;
    _s3service = new s3_servics_1.s3service();
    notificationservice = notification_service_1.default;
    constructor() { }
    createstory = async (req, res, next) => {
        try {
            const { content } = req.body;
            let urls = [];
            const folderid = (0, node_crypto_1.randomUUID)();
            if (req?.files) {
                urls = await this._s3service.uploadfiles({
                    files: req.files,
                    path: `users/${req.user._id}/stories/${folderid}`,
                    store_type: multerenum_1.store_enum.memory
                });
            }
            const story = await this._storyrepo.create({
                content,
                media: urls,
                createdby: req.user._id,
                folderid,
                expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            (0, response_success_1.successresponse)({
                res,
                message: "story created successfully",
                data: { story }
            });
        }
        catch (error) {
            next(error);
        }
        deletestory = async (req, res, next) => {
            try {
                const { storyid } = req.params;
                const story = await this._storyrepo.findone({
                    filter: {
                        _id: storyid,
                        createdby: req.user._id
                    }
                });
                if (!story) {
                    throw new AppError("story not found");
                }
                await this._s3service.deletefiles(story.media);
                await this._storyrepo.delete({
                    filter: { _id: storyid }
                });
                (0, response_success_1.successresponse)({ res, message: "deleted" });
            }
            catch (error) {
                next(error);
            }
        };
    };
}
exports.default = storyservice();
//# sourceMappingURL=storyservice..js.map