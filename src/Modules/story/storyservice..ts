import { NextFunction, Request, Response } from "express"
import { randomUUID } from "node:crypto"
import { store_enum } from "../../common/enum/multerenum"
import { successresponse } from "../../common/utilis/response.success"
import { s3service } from "../../common/service/s3.servics"
import notificationService from "../../common/service/notification.service"
import { userRepository } from "../../db/repositry/user repository "
class storyservice{
     private readonly _usermodel = new userRepository()
        private readonly _redisservice = redisService
        private readonly _s3service=new s3service()
        private readonly notificationservice= notificationService


        constructor(){}
createstory = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { content } = req.body

        let urls: string[] = []
        const folderid = randomUUID()

        if (req?.files) {
            urls = await this._s3service.uploadfiles({
                files: req.files as Express.Multer.File[],
                path: `users/${req.user._id}/stories/${folderid}`,
                store_type: store_enum.memory
            })
        }

        const story = await this._storyrepo.create({
            content,
            media: urls,
            createdby: req.user._id,
            folderid,
            expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })

        successresponse({
            res,
            message: "story created successfully",
            data: { story }
        })

    } catch (error) {
        next(error)
    }
    deletestory = async (req, res, next) => {
        try {
            const { storyid } = req.params

            const story = await this._storyrepo.findone({
                filter: {
                    _id: storyid,
                    createdby: req.user._id
                }
            })

            if (!story) {
                throw new AppError("story not found")
            }

            await this._s3service.deletefiles(story.media)

            await this._storyrepo.delete({
                filter: { _id: storyid }
            })

            successresponse({ res, message: "deleted" })
        } catch (error) {
            next(error)
        }
    }
}}
export default storyservice()