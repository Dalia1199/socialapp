import {Router} from "express";
import chatService from "./chat.service";
import { authentication } from "../../common/middleware/authentication";
import multercloud from "../../common/middleware/multer.cloud";
const cs=new chatService()
const chatRouter=Router({mergeParams:true});
chatRouter.get("/",authentication,chatService.getchat)
chatRouter.post('/',authentication,multercloud({filetype.image}).single("attachment"),cs.creategroupchat)
chatRouter.get('/group/:groupid',authentication,cs.getgroupchat)

export default chatRouter



