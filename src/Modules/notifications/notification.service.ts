import { NextFunction, Request, Response } from "express"
import { AppError } from "../../common/utilis/global-error-handler"
import { successresponse } from "../../common/utilis/response.success"
import { notificationRepository } from "../../db/repositry/notification.repository"
import { userRepository } from "../../db/repositry/user repository "
import redisService from "../../common/service/redis.service"
import notificationService from "../../common/service/notification.service"
import { Types } from "mongoose"

class notificationmoduleservice {
    private readonly _notirepo = new notificationRepository()
    private readonly _userrepo = new userRepository()
    private readonly _redis = redisService
    private readonly _fcm = notificationService

    constructor() { }

    createnotification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, body, recipients } = req.body

            const notification = await this._notirepo.create({
                title,
                body,
                createdby: req.user._id,
                recipients: recipients?.map((id: string) => new Types.ObjectId(id)) || []
            })

            let fcmtokens: string[] = []

            if (recipients?.length) {
                for (const id of recipients) {
                    const tokens = await this._redis.getfcms(new Types.ObjectId(id))
                    fcmtokens.push(...tokens)
                }
            } else {
                const allusers = await this._userrepo.find({ filter: { confirmed: true, isdeleted: { $ne: true } } as any })
                for (const u of allusers) {
                    const tokens = await this._redis.getfcms(u._id)
                    fcmtokens.push(...tokens)
                }
            }

            if (fcmtokens.length) {
                await this._fcm.sendnotifications({ tokens: fcmtokens, data: { title, body } })
            }

            successresponse({ res, status: 201, message: "notification created", data: { notification } })
        } catch (error) { next(error) }
    }

    getnotifications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this._notirepo.paginate({
                page: +req.query.page! || 1,
                limit: +req.query.limit! || 20,
                sort: { createdAt: -1 },
                populate: [{ path: "createdby", select: "fname lname email" }],
                search: { isdeleted: { $ne: true } } as any
            })
            successresponse({ res, data: result })
        } catch (error) { next(error) }
    }

    getmynotifications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userid = req.user._id
            const result = await this._notirepo.paginate({
                page: +req.query.page! || 1,
                limit: +req.query.limit! || 20,
                sort: { createdAt: -1 },
                search: {
                    isdeleted: { $ne: true },
                    $or: [
                        { recipients: { $size: 0 } },     
                        { recipients: userid }               
                    ]
                } as any
            })
            successresponse({ res, data: result })
        } catch (error) { next(error) }
    }

    markasread = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { notificationid } = req.params
            const notification = await this._notirepo.findoneAndUpdate({
                filter: { _id: notificationid, isdeleted: { $ne: true } } as any,
                update: { $addToSet: { isread: req.user._id } }
            })
            if (!notification) throw new AppError("notification not found", 404)
            successresponse({ res, message: "marked as read" })
        } catch (error) { next(error) }
    }

    updatenotification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { notificationid } = req.params
            const { title, body, recipients } = req.body
            const notification = await this._notirepo.findoneAndUpdate({
                filter: { _id: notificationid, createdby: req.user._id, isdeleted: { $ne: true } } as any,
                update: {
                    ...(title && { title }),
                    ...(body && { body }),
                    ...(recipients && { recipients: recipients.map((id: string) => new Types.ObjectId(id)) })
                }
            })
            if (!notification) throw new AppError("notification not found or not authorized", 404)
            successresponse({ res, data: { notification } })
        } catch (error) { next(error) }
    }

    deletenotification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { notificationid } = req.params
            const notification = await this._notirepo.findoneAndUpdate({
                filter: { _id: notificationid, isdeleted: { $ne: true } } as any,
                update: { isdeleted: true }
            })
            if (!notification) throw new AppError("notification not found", 404)
            successresponse({ res, message: "notification deleted" })
        } catch (error) { next(error) }
    }
}

export default new notificationmoduleservice()
