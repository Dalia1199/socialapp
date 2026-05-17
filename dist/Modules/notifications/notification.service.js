"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_error_handler_1 = require("../../common/utilis/global-error-handler");
const response_success_1 = require("../../common/utilis/response.success");
const notification_repository_1 = require("../../db/repositry/notification.repository");
const user_repository_1 = require("../../db/repositry/user repository ");
const redis_service_1 = __importDefault(require("../../common/service/redis.service"));
const notification_service_1 = __importDefault(require("../../common/service/notification.service"));
const mongoose_1 = require("mongoose");
class notificationmoduleservice {
    _notirepo = new notification_repository_1.notificationRepository();
    _userrepo = new user_repository_1.userRepository();
    _redis = redis_service_1.default;
    _fcm = notification_service_1.default;
    constructor() { }
    createnotification = async (req, res, next) => {
        try {
            const { title, body, recipients } = req.body;
            const notification = await this._notirepo.create({
                title,
                body,
                createdby: req.user._id,
                recipients: recipients?.map((id) => new mongoose_1.Types.ObjectId(id)) || []
            });
            let fcmtokens = [];
            if (recipients?.length) {
                for (const id of recipients) {
                    const tokens = await this._redis.getfcms(new mongoose_1.Types.ObjectId(id));
                    fcmtokens.push(...tokens);
                }
            }
            else {
                const allusers = await this._userrepo.find({ filter: { confirmed: true, isdeleted: { $ne: true } } });
                for (const u of allusers) {
                    const tokens = await this._redis.getfcms(u._id);
                    fcmtokens.push(...tokens);
                }
            }
            if (fcmtokens.length) {
                await this._fcm.sendnotifications({ tokens: fcmtokens, data: { title, body } });
            }
            (0, response_success_1.successresponse)({ res, status: 201, message: "notification created", data: { notification } });
        }
        catch (error) {
            next(error);
        }
    };
    getnotifications = async (req, res, next) => {
        try {
            const result = await this._notirepo.paginate({
                page: +req.query.page || 1,
                limit: +req.query.limit || 20,
                sort: { createdAt: -1 },
                populate: [{ path: "createdby", select: "fname lname email" }],
                search: { isdeleted: { $ne: true } }
            });
            (0, response_success_1.successresponse)({ res, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    getmynotifications = async (req, res, next) => {
        try {
            const userid = req.user._id;
            const result = await this._notirepo.paginate({
                page: +req.query.page || 1,
                limit: +req.query.limit || 20,
                sort: { createdAt: -1 },
                search: {
                    isdeleted: { $ne: true },
                    $or: [
                        { recipients: { $size: 0 } },
                        { recipients: userid }
                    ]
                }
            });
            (0, response_success_1.successresponse)({ res, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    markasread = async (req, res, next) => {
        try {
            const { notificationid } = req.params;
            const notification = await this._notirepo.findoneAndUpdate({
                filter: { _id: notificationid, isdeleted: { $ne: true } },
                update: { $addToSet: { isread: req.user._id } }
            });
            if (!notification)
                throw new global_error_handler_1.AppError("notification not found", 404);
            (0, response_success_1.successresponse)({ res, message: "marked as read" });
        }
        catch (error) {
            next(error);
        }
    };
    updatenotification = async (req, res, next) => {
        try {
            const { notificationid } = req.params;
            const { title, body, recipients } = req.body;
            const notification = await this._notirepo.findoneAndUpdate({
                filter: { _id: notificationid, createdby: req.user._id, isdeleted: { $ne: true } },
                update: {
                    ...(title && { title }),
                    ...(body && { body }),
                    ...(recipients && { recipients: recipients.map((id) => new mongoose_1.Types.ObjectId(id)) })
                }
            });
            if (!notification)
                throw new global_error_handler_1.AppError("notification not found or not authorized", 404);
            (0, response_success_1.successresponse)({ res, data: { notification } });
        }
        catch (error) {
            next(error);
        }
    };
    deletenotification = async (req, res, next) => {
        try {
            const { notificationid } = req.params;
            const notification = await this._notirepo.findoneAndUpdate({
                filter: { _id: notificationid, isdeleted: { $ne: true } },
                update: { isdeleted: true }
            });
            if (!notification)
                throw new global_error_handler_1.AppError("notification not found", 404);
            (0, response_success_1.successresponse)({ res, message: "notification deleted" });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = new notificationmoduleservice();
//# sourceMappingURL=notification.service.js.map